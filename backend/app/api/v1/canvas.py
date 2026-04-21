from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.canvas_node import CanvasNodeCreate, CanvasNodeUpdate, CanvasNodeResponse
from app.schemas.common import Response
from app.models.canvas_node import CanvasNode

router = APIRouter()

@router.get("/projects/{project_id}/nodes", response_model=Response[list[CanvasNodeResponse]])
def get_nodes(project_id: str, db: Session = Depends(get_db)):
    """获取项目的所有节点"""
    nodes = db.query(CanvasNode).filter(CanvasNode.project_id == project_id).all()
    return Response(data=nodes)

@router.post("/projects/{project_id}/nodes", response_model=Response[CanvasNodeResponse])
def create_node(project_id: str, node: CanvasNodeCreate, db: Session = Depends(get_db)):
    """创建节点"""
    db_node = CanvasNode(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return Response(data=db_node)

@router.put("/projects/{project_id}/nodes/{node_id}", response_model=Response[CanvasNodeResponse])
def update_node(project_id: str, node_id: str, node: CanvasNodeUpdate, db: Session = Depends(get_db)):
    """更新节点"""
    db_node = db.query(CanvasNode).filter(CanvasNode.id == node_id, CanvasNode.project_id == project_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="节点不存在")
    update_data = node.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_node, field, value)
    db.commit()
    db.refresh(db_node)
    return Response(data=db_node)

@router.delete("/projects/{project_id}/nodes/{node_id}", response_model=Response)
def delete_node(project_id: str, node_id: str, db: Session = Depends(get_db)):
    """删除节点"""
    db_node = db.query(CanvasNode).filter(CanvasNode.id == node_id, CanvasNode.project_id == project_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="节点不存在")
    db.delete(db_node)
    db.commit()
    return Response()