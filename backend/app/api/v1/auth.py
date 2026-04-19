from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.api.deps import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, BaseResponse

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=BaseResponse)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        name=user_in.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return BaseResponse(
        data={
            "id": str(db_user.id),
            "email": db_user.email,
            "name": db_user.name
        }
    )


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            is_active=user.is_active
        )
    )
