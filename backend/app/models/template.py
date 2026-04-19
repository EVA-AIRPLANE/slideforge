from sqlalchemy import Column, String, Enum, Boolean
from app.models.base import BaseModel
import enum


class TemplateSource(enum.Enum):
    """模板来源枚举"""
    builtin = "builtin"
    user_upload = "user_upload"


class Template(BaseModel):
    """模板模型"""
    __tablename__ = "templates"
    
    name = Column(String(200), nullable=False)
    source = Column(Enum(TemplateSource), nullable=False)
    file_path = Column(String(500), nullable=False)  # .pptx 文件路径
    thumbnail = Column(String(500), nullable=True)  # 缩略图路径
    layouts = Column(String, nullable=True)  # 版式定义，JSON 格式
    parse_success = Column(Boolean, default=True)  # 解析是否成功
