from fastapi import APIRouter
from app.api.v1 import auth, projects, canvas, templates, ai, slides

# 创建 v1 路由器
router = APIRouter()

# 注册子路由
router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(canvas.router)
router.include_router(templates.router)
router.include_router(slides.router)
router.include_router(ai.router, prefix="/ai")
