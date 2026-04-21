from pydantic import BaseModel
from typing import Optional, Dict, Any

class AIGenerateRequest(BaseModel):
    """AI 生成请求"""
    project_id: str
    node_ids: Optional[list] = None

class AIOutlineRequest(BaseModel):
    """AI 大纲生成请求"""
    project_id: str
    topic: str
    preferences: Optional[Dict[str, Any]] = None

class AIStatusResponse(BaseModel):
    """AI 生成状态响应"""
    task_id: str
    status: str  # pending / processing / completed / failed
    progress: float  # 0-100
    result: Optional[Dict[str, Any]] = None