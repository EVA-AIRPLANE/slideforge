from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class ProjectMode(enum.Enum):
    """项目模式枚举"""
    designer = "designer"
    collab = "collab"
    auto = "auto"


class ProjectStatus(enum.Enum):
    """项目状态枚举"""
    draft = "draft"
    generating = "generating"
    ready = "ready"


class Project(BaseModel):
    """项目模型"""
    __tablename__ = "projects"
    
    name = Column(String(200), nullable=False)
    mode = Column(Enum(ProjectMode), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.draft)
    template_id = Column(UUID(as_uuid=True), nullable=True)  # 关联模板 ID
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # 关系
    user = relationship("User", back_populates="projects")
    canvas_nodes = relationship("CanvasNode", back_populates="project", cascade="all, delete-orphan")
    slides = relationship("Slide", back_populates="project", cascade="all, delete-orphan")
