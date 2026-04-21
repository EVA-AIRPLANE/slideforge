from sqlalchemy import Column, String, Text, ForeignKey, Integer, Boolean
from app.models.base import BaseModel

class CanvasNode(BaseModel):
    """画布节点模型"""
    __tablename__ = "canvas_nodes"
    
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    parent_id = Column(String, ForeignKey("canvas_nodes.id"), nullable=True)
    node_type = Column(String, nullable=False)  # root / chapter / content / point
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    speaker_notes = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, default=0)
    level = Column(Integer, nullable=False, default=0)
    ai_description_enabled = Column(Boolean, nullable=False, default=False)
    ai_generated = Column(Boolean, nullable=False, default=False)
    position = Column(String, nullable=True)  # 画布坐标 JSON