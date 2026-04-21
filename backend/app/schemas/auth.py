from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    """用户创建请求"""
    email: str = Field(..., pattern="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    password: str
    name: str

class UserLogin(BaseModel):
    """用户登录请求"""
    email: str = Field(..., pattern="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    password: str

class Token(BaseModel):
    """token 响应"""
    access_token: str
    token_type: str = "bearer"