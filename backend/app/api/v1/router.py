from fastapi import APIRouter
from app.api.v1 import auth, projects, canvas, templates, ai, export

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(canvas.router, prefix="/canvas", tags=["canvas"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(export.router, prefix="/exports", tags=["exports"])