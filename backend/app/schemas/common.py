from pydantic import BaseModel
from typing import List, Dict, Any


class BaseResponse(BaseModel):
    """基础响应模型"""
    code: int = 0
    message: str = "success"


class PaginatedResponse(BaseModel):
    """分页响应模型"""
    code: int = 0
    message: str = "success"


class Pagination(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20
