from sqlalchemy import Column, String, Text
from app.models.base import BaseModel

class Template(BaseModel):
    """模板模型"""
    __tablename__ = "templates"
    
    name = Column(String(200), nullable=False)
    source = Column(String, nullable=False)  # builtin / user_upload
    file_path = Column(String(500), nullable=False)
    thumbnail = Column(String(500), nullable=True)
    layouts = Column(Text, nullable=True)  # 版式定义 JSON