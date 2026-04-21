from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar('T')

class Response(BaseModel, Generic[T]):
    """通用响应模型"""
    code: int = 0
    message: str = "success"
    data: Optional[T] = None

class Pagination(BaseModel, Generic[T]):
    """分页响应模型"""
    items: List[T]
    total: int
    page: int
    page_size: int