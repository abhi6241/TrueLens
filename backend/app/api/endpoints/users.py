import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.auth import get_current_user

logger = logging.getLogger("truelens.users")
router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user

@router.put("/me/settings", response_model=UserResponse)
async def update_my_settings(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates profile information for the currently logged-in user in PostgreSQL."""
    if payload.first_name is not None:
        current_user.first_name = payload.first_name
    if payload.last_name is not None:
        current_user.last_name = payload.last_name
    if payload.profile_image_url is not None:
        current_user.profile_image_url = payload.profile_image_url
    # Role cannot be updated by standard users directly (restricted to admins/webhooks)
    if payload.role is not None and current_user.role == "admin":
        current_user.role = payload.role
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    logger.info(f"User {current_user.id} updated their settings successfully.")
    return current_user
