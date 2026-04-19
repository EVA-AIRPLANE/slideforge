from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.models import ExportStatus, ExportFormat


class ExportCreate(BaseModel):
    """创建导出任务请求模型"""
    project_id: str
    format: ExportFormat


class ExportResponse(BaseModel):
    """导出任务响应模型"""
    id: str
    project_id: str
    status: ExportStatus
    format: ExportFormat
    file_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)
