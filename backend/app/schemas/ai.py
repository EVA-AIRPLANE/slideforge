from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AIGenerateRequest(BaseModel):
    """AI 生成请求模型"""
    project_id: str
    mode: str


class AIOutlineRequest(BaseModel):
    """AI 大纲生成请求模型"""
    topic: str
    preferences: Optional[Dict[str, Any]] = None


class AIContentRequest(BaseModel):
    """AI 内容生成请求模型"""
    node_id: str
    topic: str
    context: Optional[str] = None


class AIImageSearchRequest(BaseModel):
    """AI 图片搜索请求模型"""
    keyword: str
    per_page: int = 5


class AIImageUnderstandRequest(BaseModel):
    """AI 图片理解请求模型"""
    image_url: str
    node_title: str
    parent_title: str
    siblings: List[str]


class AIGenerateResponse(BaseModel):
    """AI 生成响应模型"""
    task_id: str
    status: str


class AIOutlineResponse(BaseModel):
    """AI 大纲生成响应模型"""
    nodes: List[Dict[str, Any]]


class AIContentResponse(BaseModel):
    """AI 内容生成响应模型"""
    description: str
    ai_generated: bool = True


class AIImageSearchResponse(BaseModel):
    """AI 图片搜索响应模型"""
    images: List[Dict[str, Any]]


class AIImageUnderstandResponse(BaseModel):
    """AI 图片理解响应模型"""
    description: str


class AIStatusResponse(BaseModel):
    """AI 生成状态响应模型"""
    task_id: str
    status: str
    progress: int
    result: Optional[Dict[str, Any]] = None
