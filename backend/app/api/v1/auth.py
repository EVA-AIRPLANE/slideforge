from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserCreate, UserLogin, Token
from app.schemas.common import Response

router = APIRouter()

@router.post("/register", response_model=Response[Token])
def register(user: UserCreate):
    """用户注册"""
    # 这里应该实现用户注册逻辑
    # 暂时返回一个模拟的 token
    return Response(data=Token(access_token="mock_token"))

@router.post("/login", response_model=Response[Token])
def login(user: UserLogin):
    """用户登录"""
    # 这里应该实现用户登录逻辑
    # 暂时返回一个模拟的 token
    return Response(data=Token(access_token="mock_token"))