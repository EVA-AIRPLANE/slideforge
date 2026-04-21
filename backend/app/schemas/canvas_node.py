from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CanvasNodeCreate(BaseModel):
    """画布节点创建请求"""
    project_id: str
    parent_id: Optional[str] = None
    node_type: str = Field(..., pattern="^(root|chapter|content|point)$")
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    speaker_notes: Optional[str] = None
    order: int = 0
    level: int = 0
    ai_description_enabled: bool = False
    position: Optional[str] = None

class CanvasNodeUpdate(BaseModel):
    """画布节点更新请求"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    speaker_notes: Optional[str] = None
    order: Optional[int] = None
    level: Optional[int] = None
    ai_description_enabled: Optional[bool] = None
    position: Optional[str] = None

class CanvasNodeResponse(BaseModel):
    """画布节点响应"""
    id: str
    project_id: str
    parent_id: Optional[str]
    node_type: str
    title: str
    description: Optional[str]
    speaker_notes: Optional[str]
    order: int
    level: int
    ai_description_enabled: bool
    ai_generated: bool
    position: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True