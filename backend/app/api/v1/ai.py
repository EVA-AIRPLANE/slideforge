from fastapi import APIRouter, HTTPException
from app.schemas.ai import (
    AIOutlineRequest,
    AIOutlineResponse,
    AIContentRequest,
    AIContentResponse,
    AIImageSearchRequest,
    AIImageSearchResponse,
    AIImageUnderstandRequest,
    AIImageUnderstandResponse
)
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/outline", response_model=AIOutlineResponse)
async def generate_outline(request: AIOutlineRequest):
    """AI生成PPT大纲"""
    try:
        nodes = await ai_service.generate_outline(request.topic, request.preferences)
        return AIOutlineResponse(nodes=nodes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成大纲失败: {str(e)}")


@router.post("/content", response_model=AIContentResponse)
async def generate_content(request: AIContentRequest):
    """AI为节点生成内容描述"""
    try:
        description = await ai_service.generate_content(request.topic, request.context)
        return AIContentResponse(description=description, ai_generated=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成内容失败: {str(e)}")


@router.post("/images/search", response_model=AIImageSearchResponse)
async def search_images(request: AIImageSearchRequest):
    """AI搜索图片"""
    try:
        images = await ai_service.search_images(request.keyword, request.per_page)
        return AIImageSearchResponse(images=images)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索图片失败: {str(e)}")


@router.post("/images/understand", response_model=AIImageUnderstandResponse)
async def understand_image(request: AIImageUnderstandRequest):
    """AI理解图片并生成描述"""
    try:
        description = await ai_service.understand_image(
            request.image_url,
            request.node_title,
            request.parent_title,
            request.siblings
        )
        return AIImageUnderstandResponse(description=description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片理解失败: {str(e)}")
