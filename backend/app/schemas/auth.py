from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class UserCreate(BaseModel):
    """用户注册请求模型"""
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """用户登录请求模型"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """用户信息响应模型"""
    id: str
    email: EmailStr
    name: str
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """登录令牌响应模型"""
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse
