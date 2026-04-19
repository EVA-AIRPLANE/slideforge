from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class NodeImageCreate(BaseModel):
    """创建节点图片请求模型"""
    url: str
    thumbnail: str
    caption: Optional[str] = None
    order: int = 0

class NodeImageResponse(BaseModel):
    """节点图片响应模型"""
    id: str
    url: str
    thumbnail: str
    caption: Optional[str] = None
    order: int

class NodeData(BaseModel):
    """节点数据"""
    title: str
    description: Optional[str] = ""
    speakerNotes: Optional[str] = ""
    images: List[NodeImageResponse] = []
    aiDescriptionEnabled: bool = False
    order: int = 0
    level: int = 0
    aiGenerated: Optional[bool] = False

class NodeCreate(BaseModel):
    """创建节点请求模型"""
    type: str
    parentId: Optional[str] = None
    data: NodeData
    position: Dict[str, float]

class NodeUpdate(BaseModel):
    """更新节点请求模型"""
    data: Optional[NodeData] = None
    position: Optional[Dict[str, float]] = None

class NodeResponse(BaseModel):
    """节点响应模型"""
    id: str
    type: str
    data: NodeData
    position: Dict[str, float]
    parentId: Optional[str] = None

class NodeReorderRequest(BaseModel):
    """节点重排序请求模型"""
    nodeId: str
    newParentId: Optional[str] = None
    newOrder: Optional[int] = None

class CanvasData(BaseModel):
    """画布数据响应模型"""
    nodes: List[NodeResponse]
    edges: List[Dict[str, Any]]