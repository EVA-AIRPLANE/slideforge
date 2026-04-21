from sqlalchemy import Column, String, ForeignKey
from app.models.base import BaseModel

class Project(BaseModel):
    """项目模型"""
    __tablename__ = "projects"
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    mode = Column(String, nullable=False)  # designer / collab / auto
    status = Column(String, nullable=False, default="draft")  # draft / generating / ready
    template_id = Column(String, ForeignKey("templates.id"), nullable=True)