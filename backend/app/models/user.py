from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    """用户模型"""
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # 关系
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    export_tasks = relationship("ExportTask", back_populates="user", cascade="all, delete-orphan")
