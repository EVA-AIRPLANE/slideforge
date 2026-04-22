from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import asyncio
import uuid
from app.api.deps import get_db
from app.schemas.ai import AIGenerateRequest, AIOutlineRequest, AIStatusResponse, AIContentRequest, AIImageRequest
from app.schemas.common import Response
from app.services.ai_engine.content_gen import generate_content
from app.services.ai_engine.image_understand import understand_image
from app.services.ai_engine.image_search import search_images
from app.services.ai_engine.outline_gen import generate_outline

router = APIRouter()

# 模拟任务状态存储
task_statuses = {}

@router.post("/projects/{project_id}/ai/generate", response_model=Response[AIStatusResponse])
def generate_content_endpoint(
    project_id: str, 
    request: AIGenerateRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """触发 AI 生成（按当前模式）"""
    task_id = str(uuid.uuid4())
    task_statuses[task_id] = {
        "status": "pending",
        "progress": 0,
        "result": None
    }
    # 后台任务
    background_tasks.add_task(generate_content_task, task_id, request.topic, request.context)
    status = AIStatusResponse(
        task_id=task_id,
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.post("/projects/{project_id}/ai/outline", response_model=Response[AIStatusResponse])
def generate_outline_endpoint(
    project_id: str, 
    request: AIOutlineRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """生成大纲 → 画布节点结构（自动模式）"""
    task_id = str(uuid.uuid4())
    task_statuses[task_id] = {
        "status": "pending",
        "progress": 0,
        "result": None
    }
    # 后台任务
    background_tasks.add_task(generate_outline_task, task_id, request.topic, request.preferences)
    status = AIStatusResponse(
        task_id=task_id,
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.post("/projects/{project_id}/ai/content", response_model=Response[AIStatusResponse])
def generate_node_content(
    project_id: str, 
    request: AIContentRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """生成单节点内容（协作模式）"""
    task_id = str(uuid.uuid4())
    task_statuses[task_id] = {
        "status": "pending",
        "progress": 0,
        "result": None
    }
    # 后台任务
    background_tasks.add_task(generate_content_task, task_id, request.topic, request.context)
    status = AIStatusResponse(
        task_id=task_id,
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.post("/projects/{project_id}/ai/images", response_model=Response[AIStatusResponse])
def generate_images(
    project_id: str, 
    request: AIImageRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """AI 配图（Pexels 搜索）"""
    task_id = str(uuid.uuid4())
    task_statuses[task_id] = {
        "status": "pending",
        "progress": 0,
        "result": None
    }
    # 后台任务
    background_tasks.add_task(generate_images_task, task_id, request.keyword)
    status = AIStatusResponse(
        task_id=task_id,
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.post("/projects/{project_id}/ai/describe-image", response_model=Response[AIStatusResponse])
def describe_image(
    project_id: str, 
    request: AIImageRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """AI 图片理解（GLM-4.6V-Flash）"""
    task_id = str(uuid.uuid4())
    task_statuses[task_id] = {
        "status": "pending",
        "progress": 0,
        "result": None
    }
    # 后台任务
    background_tasks.add_task(describe_image_task, task_id, request.image_url, request.node_title, request.parent_title, request.siblings)
    status = AIStatusResponse(
        task_id=task_id,
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.get("/projects/{project_id}/ai/status", response_model=Response[AIStatusResponse])
def get_ai_status(project_id: str, task_id: str, db: Session = Depends(get_db)):
    """查询生成进度"""
    if task_id not in task_statuses:
        raise HTTPException(status_code=404, detail="任务不存在")
    task = task_statuses[task_id]
    status = AIStatusResponse(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        result=task["result"]
    )
    return Response(data=status)

# 后台任务函数
async def generate_content_task(task_id: str, topic: str, context: str):
    """生成内容的后台任务"""
    try:
        task_statuses[task_id]["progress"] = 30
        await asyncio.sleep(1)  # 模拟耗时
        content = generate_content(topic, context)
        task_statuses[task_id]["progress"] = 100
        task_statuses[task_id]["status"] = "completed"
        task_statuses[task_id]["result"] = {"content": content}
    except Exception as e:
        task_statuses[task_id]["status"] = "failed"
        task_statuses[task_id]["result"] = {"error": str(e)}

async def generate_outline_task(task_id: str, topic: str, preferences: dict):
    """生成大纲的后台任务"""
    try:
        task_statuses[task_id]["progress"] = 30
        await asyncio.sleep(2)  # 模拟耗时
        outline = generate_outline(topic, preferences)
        task_statuses[task_id]["progress"] = 100
        task_statuses[task_id]["status"] = "completed"
        task_statuses[task_id]["result"] = outline
    except Exception as e:
        task_statuses[task_id]["status"] = "failed"
        task_statuses[task_id]["result"] = {"error": str(e)}

async def generate_images_task(task_id: str, keyword: str):
    """生成图片的后台任务"""
    try:
        task_statuses[task_id]["progress"] = 50
        await asyncio.sleep(1)  # 模拟耗时
        images = search_images(keyword)
        task_statuses[task_id]["progress"] = 100
        task_statuses[task_id]["status"] = "completed"
        task_statuses[task_id]["result"] = {"images": images}
    except Exception as e:
        task_statuses[task_id]["status"] = "failed"
        task_statuses[task_id]["result"] = {"error": str(e)}

async def describe_image_task(task_id: str, image_url: str, node_title: str, parent_title: str, siblings: list):
    """描述图片的后台任务"""
    try:
        task_statuses[task_id]["progress"] = 50
        await asyncio.sleep(2)  # 模拟耗时
        description = understand_image(image_url, node_title, parent_title, siblings)
        task_statuses[task_id]["progress"] = 100
        task_statuses[task_id]["status"] = "completed"
        task_statuses[task_id]["result"] = {"description": description}
    except Exception as e:
        task_statuses[task_id]["status"] = "failed"
        task_statuses[task_id]["result"] = {"error": str(e)}
