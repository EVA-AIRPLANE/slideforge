from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from app.models import TemplateSource
import json


class TemplateCreate(BaseModel):
    """创建模板请求模型"""
    name: str
    source: TemplateSource
    file_path: str
    thumbnail: Optional[str] = None
    layouts: Optional[Dict[str, Any]] = None
    parse_success: bool = True


class TemplateResponse(BaseModel):
    """模板响应模型"""
    id: str
    name: str
    source: TemplateSource
    file_path: Optional[str] = None
    thumbnail: Optional[str] = None
    layouts: Optional[Dict[str, Any]] = None
    parse_success: bool = True
    created_at: Any
    updated_at: Any
    
    @classmethod
    def from_orm(cls, obj):
        data = {
            'id': str(obj.id),  # 确保UUID转换为字符串
            'name': obj.name,
            'source': obj.source,
            'file_path': obj.file_path,
            'thumbnail': obj.thumbnail,
            'parse_success': obj.parse_success,
            'created_at': obj.created_at,
            'updated_at': obj.updated_at
        }
        if obj.layouts:
            try:
                data['layouts'] = json.loads(obj.layouts)
            except (json.JSONDecodeError, TypeError):
                data['layouts'] = None
        return cls(**data)
    
    model_config = ConfigDict(from_attributes=True)
