from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.models import ProjectMode, ProjectStatus


class ProjectCreate(BaseModel):
    """创建项目请求模型"""
    name: str
    mode: ProjectMode
    template_id: Optional[str] = None


class ProjectUpdate(BaseModel):
    """更新项目请求模型"""
    name: Optional[str] = None
    mode: Optional[ProjectMode] = None
    status: Optional[ProjectStatus] = None
    template_id: Optional[str] = None


class ProjectResponse(BaseModel):
    """项目响应模型"""
    id: str
    name: str
    mode: ProjectMode
    status: ProjectStatus
    template_id: Optional[str] = None
    user_id: str
    created_at: str
    updated_at: str
    
    model_config = ConfigDict(from_attributes=True)
