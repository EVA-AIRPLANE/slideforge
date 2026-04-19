from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Settings(BaseModel):
    """应用配置"""
    # 数据库
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://slideforge_user:slideforge_password@localhost:5432/slideforge")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # 对象存储
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    
    # AI 服务
    ZHIPU_API_KEY: str = os.getenv("ZHIPU_API_KEY", "")
    PEXELS_API_KEY: str = os.getenv("PEXELS_API_KEY", "")
    
    # 认证
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_EXPIRE_HOURS: int = 24
    
    # 应用
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # 文件存储
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    TEMPLATES_DIR: str = os.path.join(UPLOAD_DIR, "templates")
    THUMBNAILS_DIR: str = os.path.join(UPLOAD_DIR, "thumbnails")


# 创建全局配置实例
settings = Settings()
