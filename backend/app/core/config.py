from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 数据库配置
    DATABASE_URL: str = "sqlite:///../data/slideforge.db"
    
    # 应用配置
    APP_NAME: str = "SlideForge"
    APP_VERSION: str = "1.0.0"
    
    # 文件存储配置
    UPLOAD_DIR: str = "./data/uploads"
    EXPORT_DIR: str = "./data/exports"
    
    # AI 配置
    ZHIPU_API_KEY: Optional[str] = None
    PEXELS_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()