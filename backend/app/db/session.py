import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("truelens.db")
Base = declarative_base()

class DatabaseManager:
    def __init__(self):
        self.engine = None
        self.session_maker = None
        self.is_sqlite = False

    def initialize(self, force_sqlite: bool = False):
        if force_sqlite:
            self.fallback_to_sqlite()
            return

        db_url = settings.DATABASE_URL
        # Extract host name for logging
        host_log = db_url.split('@')[-1] if '@' in db_url else db_url
        logger.info(f"Attempting connection to database: {host_log}")
        try:
            self.engine = create_async_engine(
                db_url,
                echo=False,
                future=True,
                pool_size=10,
                max_overflow=20,
                pool_recycle=1800
            )
            self.session_maker = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            self.is_sqlite = "sqlite" in db_url
        except Exception as e:
            logger.error(f"Failed to initialize database engine for {host_log}: {e}")
            self.fallback_to_sqlite()

    def fallback_to_sqlite(self):
        fallback_url = "sqlite+aiosqlite:///./truelens.db"
        logger.warning(f"Falling back to local SQLite database: {fallback_url}")
        self.engine = create_async_engine(
            fallback_url,
            echo=False,
            future=True
        )
        self.session_maker = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        self.is_sqlite = True

    async def test_connection(self) -> bool:
        if not self.engine:
            self.initialize()
        from sqlalchemy import text
        try:
            async with self.session_maker() as session:
                await session.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.warning(f"Connection test failed: {e}")
            return False

db_manager = DatabaseManager()

# Async DB Dependency
async def get_db():
    if not db_manager.session_maker:
        db_manager.initialize()
    async with db_manager.session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
