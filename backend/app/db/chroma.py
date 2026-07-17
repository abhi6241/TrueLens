import os
import logging
import chromadb
from app.core.config import settings

logger = logging.getLogger(__name__)

class ChromaManager:
    def __init__(self):
        self.client = None

    def connect(self):
        try:
            # Attempt standalone HTTP Client connection
            self.client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT
            )
            # Try a simple call to verify connection
            self.client.heartbeat()
            logger.info(f"Successfully connected to standalone ChromaDB server at {settings.CHROMA_HOST}:{settings.CHROMA_PORT}")
        except Exception as e:
            logger.warning(f"Failed to connect to standalone ChromaDB server: {e}. Falling back to local PersistentClient.")
            try:
                # Fallback to local persistent client
                os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
                self.client = chromadb.PersistentClient(
                    path=settings.CHROMA_PERSIST_DIRECTORY
                )
                logger.info(f"Successfully configured local ChromaDB PersistentClient at {settings.CHROMA_PERSIST_DIRECTORY}")
            except Exception as le:
                logger.error(f"Failed to initialize local ChromaDB client: {le}")
                # Fallback to Ephemeral (in-memory) Client as absolute last resort
                self.client = chromadb.EphemeralClient()
                logger.info("Configured fallback in-memory EphemeralClient for ChromaDB.")

    def get_client(self):
        if not self.client:
            self.connect()
        return self.client

    def is_healthy(self) -> bool:
        if not self.client:
            return False
        try:
            self.client.heartbeat()
            return True
        except Exception as e:
            logger.error(f"ChromaDB health check failed: {e}")
            return False

chroma_manager = ChromaManager()

# FastAPI Dependency
def get_chroma():
    return chroma_manager.get_client()
