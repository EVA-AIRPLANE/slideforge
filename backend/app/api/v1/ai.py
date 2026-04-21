from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.ai import AIGenerateRequest, AIOutlineRequest, AIStatusResponse
from app.schemas.common import Response

router = APIRouter()

@router.post("/projects/{project_id}/ai/generate", response_model=Response[AIStatusResponse])
def generate_content(project_id: str, request: AIGenerateRequest, db: Session = Depends(get_db)):
    """触发 AI 生成（按当前模式）"""
    # 这里应该实现 AI 生成逻辑
    # 暂时返回一个模拟的状态
    status = AIStatusResponse(
        task_id="task-123",
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.post("/projects/{project_id}/ai/outline", response_model=Response[AIStatusResponse])
def generate_outline(project_id: str, request: AIOutlineRequest, db: Session = Depends(get_db)):
    """生成大纲 → 画布节点结构（自动模式）"""
    # 这里应该实现大纲生成逻辑
    # 暂时返回一个模拟的状态
    status = AIStatusResponse(
        task_id="task-456",
        status="pending",
        progress=0,
        result=None
    )
    return Response(data=status)

@router.get("/projects/{project_id}/ai/status", response_model=Response[AIStatusResponse])
def get_ai_status(project_id: str, task_id: str, db: Session = Depends(get_db)):
    """查询生成进度"""
    # 这里应该实现查询 AI 生成状态的逻辑
    # 暂时返回一个模拟的状态
    status = AIStatusResponse(
        task_id=task_id,
        status="completed",
        progress=100,
        result={"nodes": []}
    )
    return Response(data=status)