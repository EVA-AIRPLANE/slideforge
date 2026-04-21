from sqlalchemy import Column, String
from app.models.base import BaseModel

class User(BaseModel):
    """用户模型"""
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)