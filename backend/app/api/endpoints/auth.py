import base64
import hashlib
import hmac
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger("truelens.auth_endpoints")
router = APIRouter()

def verify_svix_signature(body: str, svix_id: str, svix_timestamp: str, svix_signature: str, secret: str) -> bool:
    """
    Verifies that the webhook request came from Clerk.
    Uses standard HMAC-SHA256 signature verification matching Svix.
    """
    if not svix_id or not svix_timestamp or not svix_signature or not secret:
        return False
    
    # Clerk signing secrets start with whsec_
    cleaned_secret = secret.replace("whsec_", "")
    try:
        secret_bytes = base64.b64decode(cleaned_secret)
    except Exception:
        # Fallback to UTF-8 encoded bytes if not base64
        secret_bytes = cleaned_secret.encode("utf-8")
        
    to_sign = f"{svix_id}.{svix_timestamp}.{body}".encode("utf-8")
    
    signatures = svix_signature.split(" ")
    for sig in signatures:
        if not sig.startswith("v1,"):
            continue
        actual_sig_b64 = sig[3:]
        try:
            actual_sig_bytes = base64.b64decode(actual_sig_b64)
        except Exception:
            continue
            
        computed_sig = hmac.new(secret_bytes, to_sign, hashlib.sha256).digest()
        if hmac.compare_digest(computed_sig, actual_sig_bytes):
            return True
            
    return False

@router.post("/webhook")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Clerk Webhook endpoint. Registers, updates, and deletes users
    in PostgreSQL dynamically in response to Clerk signup events.
    """
    body = await request.body()
    body_str = body.decode("utf-8")
    
    # 1. Signature Verification
    if settings.CLERK_WEBHOOK_SECRET:
        svix_id = request.headers.get("svix-id")
        svix_timestamp = request.headers.get("svix-timestamp")
        svix_signature = request.headers.get("svix-signature")
        
        if not verify_svix_signature(body_str, svix_id, svix_timestamp, svix_signature, settings.CLERK_WEBHOOK_SECRET):
            logger.warning("Clerk webhook signature verification failed!")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature."
            )
    else:
        logger.warning("CLERK_WEBHOOK_SECRET not configured. Webhook payload accepted without verification.")

    # 2. Parse Webhook Event
    try:
        event = json.loads(body_str)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON payload: {str(e)}"
        )

    event_type = event.get("type")
    data = event.get("data", {})
    user_id = data.get("id")

    if not user_id:
        return {"status": "ignored", "message": "No user ID in event data"}

    # 3. Process Events
    if event_type in ["user.created", "user.updated"]:
        # Extract user email address (Clerk primary email or first in list)
        email_addresses = data.get("email_addresses", [])
        primary_email_id = data.get("primary_email_address_id")
        email = None
        for email_obj in email_addresses:
            if email_obj.get("id") == primary_email_id or not email:
                email = email_obj.get("email_address")
                
        if not email and email_addresses:
            email = email_addresses[0].get("email_address")
            
        if not email:
            email = f"{user_id}@clerk.placeholder" # Fallback email if none found

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        profile_image_url = data.get("image_url")
        
        # Role management via Clerk public metadata
        public_metadata = data.get("public_metadata", {})
        role = public_metadata.get("role", "user")

        # Check if user already exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            # Create user record
            user = User(
                id=user_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                profile_image_url=profile_image_url,
                role=role
            )
            db.add(user)
            logger.info(f"Clerk Webhook: Created user record for {user_id}")
        else:
            # Update user record
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.profile_image_url = profile_image_url
            user.role = role
            logger.info(f"Clerk Webhook: Updated user record for {user_id}")
            
        await db.commit()
        return {"status": "success", "event": event_type, "user_id": user_id}

    elif event_type == "user.deleted":
        # Delete user record from database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            await db.delete(user)
            await db.commit()
            logger.info(f"Clerk Webhook: Deleted user record for {user_id}")
            return {"status": "success", "event": "user.deleted", "user_id": user_id}
        else:
            logger.warning(f"Clerk Webhook: Attempted to delete user {user_id} but record was not found.")
            return {"status": "ignored", "message": "User not found"}

    return {"status": "ignored", "message": f"Event type '{event_type}' not handled"}
