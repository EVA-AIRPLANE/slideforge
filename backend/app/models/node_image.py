from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class NodeImage(BaseModel):
    """节点图片模型"""
    __tablename__ = "node_images"
    
    node_id = Column(UUID(as_uuid=True), ForeignKey("canvas_nodes.id"), nullable=False)
    url = Column(String(500), nullable=False)  # 图片 URL
    thumbnail = Column(String(500), nullable=False)  # 缩略图 URL
    caption = Column(String(500), nullable=True)  # 图片说明
    order = Column(Integer, nullable=False, default=0)  # 排序
    
    # 关系
    canvas_node = relationship("CanvasNode", back_populates="node_images")
