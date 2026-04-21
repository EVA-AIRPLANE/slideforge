from sqlalchemy import Column, String, Text, ForeignKey, Integer
from app.models.base import BaseModel

class Slide(BaseModel):
    """幻灯片模型"""
    __tablename__ = "slides"
    
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    source_node_id = Column(String, ForeignKey("canvas_nodes.id"), nullable=True)
    order = Column(Integer, nullable=False, default=0)
    layout_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=True)  # 页面内容 JSON
    speaker_notes = Column(Text, nullable=True)