import logging
import time
from typing import Dict, Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

class InMemoryRedis:
    """Mock Redis client that runs in memory when no server is running."""
    def __init__(self):
        self.storage: Dict[str, str] = {}
        self.expires: Dict[str, float] = {}

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> Optional[str]:
        # Check expiration
        if key in self.expires and time.time() > self.expires[key]:
            self.storage.pop(key, None)
            self.expires.pop(key, None)
            return None
        return self.storage.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self.storage[key] = str(value)
        if ex:
            self.expires[key] = time.time() + ex
        else:
            self.expires.pop(key, None)
        return True

    async def delete(self, key: str) -> bool:
        self.storage.pop(key, None)
        self.expires.pop(key, None)
        return True

    async def close(self):
        pass


class RedisClient:
    def __init__(self):
        self.client = None
        self.is_mock = False

    def connect(self):
        try:
            # Setup real Redis client
            self.client = aioredis.from_url(
                settings.REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True
            )
            logger.info("Configured real Redis client.")
        except Exception as e:
            logger.error(f"Failed to configure real Redis connection pool: {e}. Falling back to in-memory mock.")
            self.fallback_to_mock()

    def fallback_to_mock(self):
        self.client = InMemoryRedis()
        self.is_mock = True
        logger.info("Configured fallback in-memory mock Redis client.")

    async def disconnect(self):
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed.")

    async def is_healthy(self) -> bool:
        if not self.client:
            return False
        try:
            # If real connection fails, fall back to mock
            await self.client.ping()
            return True
        except Exception as e:
            logger.warning(f"Real Redis connection test failed: {e}. Switching to in-memory mock.")
            self.fallback_to_mock()
            return True

    async def get(self, key: str) -> Optional[str]:
        if not self.client:
            self.connect()
        try:
            return await self.client.get(key)
        except Exception as e:
            logger.warning(f"Redis get failed: {e}. Switching to in-memory mock.")
            self.fallback_to_mock()
            return await self.client.get(key)

    async def set(self, key: str, value: str, expire: int = None) -> bool:
        if not self.client:
            self.connect()
        try:
            await self.client.set(key, value, ex=expire)
            return True
        except Exception as e:
            logger.warning(f"Redis set failed: {e}. Switching to in-memory mock.")
            self.fallback_to_mock()
            await self.client.set(key, value, ex=expire)
            return True

    async def delete(self, key: str) -> bool:
        if not self.client:
            self.connect()
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis delete failed: {e}. Switching to in-memory mock.")
            self.fallback_to_mock()
            await self.client.delete(key)
            return True

redis_client = RedisClient()

# FastAPI Dependency
async def get_redis():
    yield redis_client
