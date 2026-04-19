from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.v1.router import router as v1_router

# 创建 FastAPI 应用实例
app = FastAPI(
    title="SlideForge API",
    description="AI 辅助 PPT 制作平台 API",
    version="1.0.0",
    debug=settings.DEBUG
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应设置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(v1_router, prefix=settings.API_PREFIX)

# 根路径
@app.get("/")
def read_root():
    return {"message": "Welcome to SlideForge API"}

# 健康检查
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# 配置静态文件服务
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
