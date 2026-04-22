from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class AIGenerateRequest(BaseModel):
    """AI 生成请求"""
    project_id: str
    node_ids: Optional[List[str]] = None
    topic: str
    context: Optional[str] = None

class AIOutlineRequest(BaseModel):
    """AI 大纲生成请求"""
    project_id: str
    topic: str
    preferences: Optional[Dict[str, Any]] = None

class AIContentRequest(BaseModel):
    """AI 单节点内容生成请求"""
    project_id: str
    topic: str
    context: Optional[str] = None

class AIImageRequest(BaseModel):
    """AI 图片生成/理解请求"""
    project_id: str
    keyword: Optional[str] = None
    image_url: Optional[str] = None
    node_title: Optional[str] = None
    parent_title: Optional[str] = None
    siblings: Optional[List[str]] = None

class AIStatusResponse(BaseModel):
    """AI 生成状态响应"""
    task_id: str
    status: str  # pending / processing / completed / failed
    progress: float  # 0-100
    result: Optional[Dict[str, Any]] = None
