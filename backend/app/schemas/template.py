from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TemplateCreate(BaseModel):
    """模板创建请求"""
    name: str = Field(..., max_length=200)
    source: str = Field(..., pattern="^(builtin|user_upload)$")
    file_path: str
    thumbnail: Optional[str] = None
    layouts: Optional[str] = None

class TemplateResponse(BaseModel):
    """模板响应"""
    id: str
    name: str
    source: str
    file_path: str
    thumbnail: Optional[str]
    layouts: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True