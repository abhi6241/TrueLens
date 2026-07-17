import json
import logging
from typing import Optional
from app.db.redis import redis_client

logger = logging.getLogger("truelens.tasks")

async def set_task_status(task_id: str, status: str, progress: int, message: str, result_id: Optional[str] = None, error: Optional[str] = None):
    """Updates the status of a background task in Redis."""
    try:
        data = {
            "task_id": task_id,
            "status": status,
            "progress": progress,
            "message": message
        }
        if result_id:
            data["result_id"] = result_id
        if error:
            data["error"] = error
            
        await redis_client.set(f"task:{task_id}", json.dumps(data), expire=3600)  # Expire in 1 hour
    except Exception as e:
        logger.error(f"Failed to set task status in Redis: {e}")

async def get_task_status(task_id: str) -> Optional[dict]:
    """Retrieves the status of a background task from Redis."""
    try:
        data_str = await redis_client.get(f"task:{task_id}")
        if data_str:
            return json.loads(data_str)
        return None
    except Exception as e:
        logger.error(f"Failed to get task status from Redis: {e}")
        return None
