from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class ExportStatus(enum.Enum):
    """导出状态枚举"""
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ExportFormat(enum.Enum):
    """导出格式枚举"""
    pptx = "pptx"
    pdf = "pdf"
    image = "image"


class ExportTask(BaseModel):
    """导出任务模型"""
    __tablename__ = "export_tasks"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    status = Column(Enum(ExportStatus), default=ExportStatus.pending)
    format = Column(Enum(ExportFormat), nullable=False)
    file_path = Column(String(500), nullable=True)  # 导出文件路径
    error_message = Column(String(500), nullable=True)  # 错误信息
    
    # 关系
    user = relationship("User", back_populates="export_tasks")
