from sqlalchemy import Column, String, DateTime, func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(128), primary_key=True, index=True)
    email = Column(String(256), nullable=False, unique=True, index=True)
    first_name = Column(String(256), nullable=True)
    last_name = Column(String(256), nullable=True)
    profile_image_url = Column(String(1024), nullable=True)
    role = Column(String(64), nullable=False, default="user")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
