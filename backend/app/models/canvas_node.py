from sqlalchemy import Column, String, ForeignKey, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CanvasNode(BaseModel):
    """画布节点模型"""
    __tablename__ = "canvas_nodes"
    
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), nullable=True)  # 父节点 ID，NULL 表示根节点
    node_type = Column(String(50), nullable=False)  # root / chapter / content / point
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)  # 文字描述
    speaker_notes = Column(Text, nullable=True)  # 演讲者备注
    order = Column(Integer, nullable=False, default=0)  # 同级排序
    level = Column(Integer, nullable=False, default=0)  # 层级深度
    ai_description_enabled = Column(Boolean, default=False)  # 是否允许 AI 生成描述
    ai_generated = Column(Boolean, default=False)  # 描述是否由 AI 生成
    position = Column(Text, nullable=True)  # 画布上的坐标，JSON 格式
    
    # 关系
    project = relationship("Project", back_populates="canvas_nodes")
    node_images = relationship("NodeImage", back_populates="canvas_node", cascade="all, delete-orphan")
