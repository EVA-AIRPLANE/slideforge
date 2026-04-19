from sqlalchemy import Column, String, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Slide(BaseModel):
    """幻灯片模型"""
    __tablename__ = "slides"
    
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    source_node_id = Column(UUID(as_uuid=True), ForeignKey("canvas_nodes.id"), nullable=True)  # 关联的画布节点 ID
    order = Column(Integer, nullable=False)  # 页面顺序
    layout_type = Column(String(50), nullable=False)  # 版式类型
    content = Column(Text, nullable=True)  # 页面内容，JSON 格式
    speaker_notes = Column(Text, nullable=True)  # 演讲者备注
    
    # 关系
    project = relationship("Project", back_populates="slides")
