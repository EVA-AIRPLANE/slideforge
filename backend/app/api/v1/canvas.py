from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db
from app.models import CanvasNode, NodeImage, Project
from app.schemas.canvas_node import (
    NodeCreate, NodeUpdate, NodeResponse, 
    NodeImageCreate, NodeImageResponse,
    NodeReorderRequest, CanvasData
)
from app.services.canvas_engine.node_manager import NodeManager
from app.services.storage.asset_store import AssetStore

router = APIRouter(prefix="/projects/{project_id}/nodes", tags=["canvas"])


@router.get("", response_model=CanvasData)
def get_nodes(
    project_id: str,
    db: Session = Depends(get_db)
):
    """获取项目的所有节点和边"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 获取所有节点
    nodes = db.query(CanvasNode).filter(CanvasNode.project_id == project_id).all()
    
    # 构建节点响应
    node_responses = []
    edges = []
    
    for node in nodes:
        # 获取节点的图片
        images = db.query(NodeImage).filter(NodeImage.node_id == node.id).all()
        image_responses = [
            NodeImageResponse(
                id=img.id,
                url=img.url,
                thumbnail=img.thumbnail,
                caption=img.caption,
                order=img.order
            )
            for img in images
        ]
        
        # 构建节点响应
        node_response = NodeResponse(
            id=node.id,
            type=node.node_type,
            data={
                "title": node.title,
                "description": node.description,
                "speakerNotes": node.speaker_notes,
                "images": image_responses,
                "aiDescriptionEnabled": node.ai_description_enabled,
                "order": node.order,
                "level": node.level,
                "aiGenerated": node.ai_generated
            },
            position=node.position,
            parentId=node.parent_id
        )
        node_responses.append(node_response)
        
        # 构建边（如果有父节点）
        if node.parent_id:
            edges.append({
                "id": f"edge-{node.id}",
                "source": node.parent_id,
                "target": node.id
            })
    
    return CanvasData(nodes=node_responses, edges=edges)


@router.post("", response_model=NodeResponse)
def create_node(
    project_id: str,
    node: NodeCreate,
    db: Session = Depends(get_db)
):
    """创建节点"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 创建节点
    node_manager = NodeManager(db)
    new_node = node_manager.create_node(
        project_id=project_id,
        node_type=node.type,
        parent_id=node.parentId,
        data=node.data,
        position=node.position
    )
    
    # 构建响应
    images = db.query(NodeImage).filter(NodeImage.node_id == new_node.id).all()
    image_responses = [
        NodeImageResponse(
            id=img.id,
            url=img.url,
            thumbnail=img.thumbnail,
            caption=img.caption,
            order=img.order
        )
        for img in images
    ]
    
    return NodeResponse(
        id=new_node.id,
        type=new_node.node_type,
        data={
            "title": new_node.title,
            "description": new_node.description,
            "speakerNotes": new_node.speaker_notes,
            "images": image_responses,
            "aiDescriptionEnabled": new_node.ai_description_enabled,
            "order": new_node.order,
            "level": new_node.level,
            "aiGenerated": new_node.ai_generated
        },
        position=new_node.position,
        parentId=new_node.parent_id
    )


@router.put("/{node_id}", response_model=NodeResponse)
def update_node(
    project_id: str,
    node_id: str,
    node_update: NodeUpdate,
    db: Session = Depends(get_db)
):
    """更新节点"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 检查节点是否存在且属于该项目
    node = db.query(CanvasNode).filter(
        CanvasNode.id == node_id,
        CanvasNode.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="节点不存在"
        )
    
    # 更新节点
    node_manager = NodeManager(db)
    updated_node = node_manager.update_node(
        node_id=node_id,
        data=node_update.data,
        position=node_update.position
    )
    
    # 构建响应
    images = db.query(NodeImage).filter(NodeImage.node_id == updated_node.id).all()
    image_responses = [
        NodeImageResponse(
            id=img.id,
            url=img.url,
            thumbnail=img.thumbnail,
            caption=img.caption,
            order=img.order
        )
        for img in images
    ]
    
    return NodeResponse(
        id=updated_node.id,
        type=updated_node.node_type,
        data={
            "title": updated_node.title,
            "description": updated_node.description,
            "speakerNotes": updated_node.speaker_notes,
            "images": image_responses,
            "aiDescriptionEnabled": updated_node.ai_description_enabled,
            "order": updated_node.order,
            "level": updated_node.level,
            "aiGenerated": updated_node.ai_generated
        },
        position=updated_node.position,
        parentId=updated_node.parent_id
    )


@router.delete("/{node_id}")
def delete_node(
    project_id: str,
    node_id: str,
    db: Session = Depends(get_db)
):
    """删除节点"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 检查节点是否存在且属于该项目
    node = db.query(CanvasNode).filter(
        CanvasNode.id == node_id,
        CanvasNode.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="节点不存在"
        )
    
    # 删除节点
    node_manager = NodeManager(db)
    node_manager.delete_node(node_id)
    
    return {"message": "节点删除成功"}


@router.put("/reorder")
def reorder_nodes(
    project_id: str,
    request: NodeReorderRequest,
    db: Session = Depends(get_db)
):
    """调整节点顺序/层级"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 检查节点是否存在且属于该项目
    node = db.query(CanvasNode).filter(
        CanvasNode.id == request.nodeId,
        CanvasNode.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="节点不存在"
        )
    
    # 调整节点顺序/层级
    node_manager = NodeManager(db)
    node_manager.reorder_node(
        node_id=request.nodeId,
        new_parent_id=request.newParentId,
        new_order=request.newOrder
    )
    
    return {"message": "节点顺序调整成功"}


@router.post("/{node_id}/images", response_model=NodeImageResponse)
async def upload_image(
    project_id: str,
    node_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传图片到节点"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 检查节点是否存在且属于该项目
    node = db.query(CanvasNode).filter(
        CanvasNode.id == node_id,
        CanvasNode.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="节点不存在"
        )
    
    # 上传图片
    asset_store = AssetStore()
    image_data = await asset_store.upload_image(file, project_id, node_id)
    
    # 创建节点图片记录
    node_image = NodeImage(
        node_id=node_id,
        url=image_data["url"],
        thumbnail=image_data["thumbnail"],
        caption=file.filename,
        order=0
    )
    db.add(node_image)
    db.commit()
    db.refresh(node_image)
    
    return NodeImageResponse(
        id=node_image.id,
        url=node_image.url,
        thumbnail=node_image.thumbnail,
        caption=node_image.caption,
        order=node_image.order
    )


@router.delete("/{node_id}/images/{image_id}")
def delete_node_image(
    project_id: str,
    node_id: str,
    image_id: str,
    db: Session = Depends(get_db)
):
    """删除节点图片"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 检查节点是否存在且属于该项目
    node = db.query(CanvasNode).filter(
        CanvasNode.id == node_id,
        CanvasNode.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="节点不存在"
        )
    
    # 检查图片是否存在且属于该节点
    image = db.query(NodeImage).filter(
        NodeImage.id == image_id,
        NodeImage.node_id == node_id
    ).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="图片不存在"
        )
    
    # 删除图片
    asset_store = AssetStore()
    asset_store.delete_image(image.url)
    
    # 删除数据库记录
    db.delete(image)
    db.commit()
    
    return {"message": "图片删除成功"}