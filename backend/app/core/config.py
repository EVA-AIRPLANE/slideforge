from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from pathlib import Path

# 项目根目录 (backend/app/core/ -> backend/ -> backend/ -> 项目根目录)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # 允许.env中有未声明的字段
    )
    
    # 数据库配置 - 使用绝对路径指向项目根目录的 data/
    DATABASE_URL: str = f"sqlite:///{PROJECT_ROOT / 'data' / 'slideforge.db'}"
    
    # 应用配置
    APP_NAME: str = "SlideForge"
    APP_VERSION: str = "1.0.0"
    
    # 文件存储配置 - 使用绝对路径
    BASE_DIR: Path = PROJECT_ROOT
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    TEMPLATE_DIR: Path = UPLOAD_DIR / "templates"
    THUMBNAIL_DIR: Path = TEMPLATE_DIR / "thumbnails"
    EXPORT_DIR: Path = BASE_DIR / "data" / "exports"
    
    # AI 配置
    ZHIPU_API_KEY: Optional[str] = None
    PEXELS_API_KEY: Optional[str] = None

settings = Settings()

# 确保目录存在
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)
settings.THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPORT_DIR.mkdir(parents=True, exist_ok=True)