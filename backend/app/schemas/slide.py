from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any


class SlideCreate(BaseModel):
    """创建幻灯片请求模型"""
    project_id: str
    source_node_id: Optional[str] = None
    order: int
    layout_type: str
    content: Optional[Dict[str, Any]] = None
    speaker_notes: Optional[str] = None


class SlideUpdate(BaseModel):
    """更新幻灯片请求模型"""
    order: Optional[int] = None
    layout_type: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    speaker_notes: Optional[str] = None


class SlideResponse(BaseModel):
    """幻灯片响应模型"""
    id: str
    project_id: str
    source_node_id: Optional[str] = None
    order: int
    layout_type: str
    content: Optional[Dict[str, Any]] = None
    speaker_notes: Optional[str] = None
    created_at: str
    updated_at: str
    
    model_config = ConfigDict(from_attributes=True)
