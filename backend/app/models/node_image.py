from sqlalchemy import Column, String, ForeignKey, Integer
from app.models.base import BaseModel

class NodeImage(BaseModel):
    """节点图片模型"""
    __tablename__ = "node_images"
    
    node_id = Column(String, ForeignKey("canvas_nodes.id"), nullable=False)
    url = Column(String(500), nullable=False)
    thumbnail = Column(String(500), nullable=False)
    caption = Column(String(500), nullable=True)
    order = Column(Integer, nullable=False, default=0)