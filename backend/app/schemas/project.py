from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    """项目创建请求"""
    name: str = Field(..., max_length=200)
    mode: str = Field(..., pattern="^(designer|collab|auto)$")
    template_id: Optional[str] = None

class ProjectUpdate(BaseModel):
    """项目更新请求"""
    name: Optional[str] = Field(None, max_length=200)
    mode: Optional[str] = Field(None, pattern="^(designer|collab|auto)$")
    status: Optional[str] = Field(None, pattern="^(draft|generating|ready)$")
    template_id: Optional[str] = None

class ProjectResponse(BaseModel):
    """项目响应"""
    id: str
    name: str
    mode: str
    status: str
    template_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True