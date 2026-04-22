from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.api.deps import get_db
from app.schemas.canvas_node import CanvasNodeCreate, CanvasNodeUpdate, CanvasNodeResponse
from app.schemas.common import Response
from app.models.canvas_node import CanvasNode
from app.models.node_image import NodeImage

router = APIRouter()

# 预览相关的schema
class SlideImage(BaseModel):
    id: str
    url: str
    thumbnail: Optional[str] = None
    caption: Optional[str] = None

class Slide(BaseModel):
    id: str
    type: str  # title / chapter / content
    title: str
    content: Optional[str] = None
    speakerNotes: Optional[str] = None
    images: List[SlideImage] = []
    level: int

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

@router.get("/projects/{project_id}/preview", response_model=Response[List[Slide]])
def get_preview(project_id: str, db: Session = Depends(get_db)):
    """获取项目预览数据"""
    # 获取所有节点
    nodes = db.query(CanvasNode).filter(CanvasNode.project_id == project_id).order_by(CanvasNode.order).all()
    
    # 如果没有数据，返回空数组
    if not nodes:
        return Response(data=[])
    
    # 获取所有节点的图片
    node_ids = [node.id for node in nodes]
    images = db.query(NodeImage).filter(NodeImage.node_id.in_(node_ids)).all()
    
    # 构建图片字典
    image_dict = {}
    for img in images:
        if img.node_id not in image_dict:
            image_dict[img.node_id] = []
        image_dict[img.node_id].append(SlideImage(
            id=img.id,
            url=img.url,
            thumbnail=img.thumbnail,
            caption=img.caption
        ))
    
    # 转换节点为幻灯片
    slides: List[Slide] = []
    
    # 找到根节点作为标题页
    root_node = next((node for node in nodes if node.node_type == 'root' or node.level == 0), None)
    if root_node:
        slides.append(Slide(
            id=root_node.id,
            type='title',
            title=root_node.title,
            content=root_node.description,
            speakerNotes=root_node.speaker_notes,
            images=image_dict.get(root_node.id, []),
            level=root_node.level
        ))
    
    # 处理章节和内容节点
    # 先处理章节（level=1）
    chapter_nodes = [node for node in nodes if node.parent_id == (root_node.id if root_node else None) or node.level == 1]
    for chapter in chapter_nodes:
        # 添加章节页
        slides.append(Slide(
            id=chapter.id,
            type='chapter',
            title=chapter.title,
            content=chapter.description,
            speakerNotes=chapter.speaker_notes,
            images=image_dict.get(chapter.id, []),
            level=chapter.level
        ))
        
        # 处理该章节下的内容节点（level=2）
        content_nodes = [node for node in nodes if node.parent_id == chapter.id or node.level == 2]
        for content in content_nodes:
            slides.append(Slide(
                id=content.id,
                type='content',
                title=content.title,
                content=content.description,
                speakerNotes=content.speaker_notes,
                images=image_dict.get(content.id, []),
                level=content.level
            ))
    
    # 如果没有找到明确的结构，就按顺序处理所有节点
    if not slides:
        for idx, node in enumerate(nodes):
            slide_type = 'content'
            if idx == 0:
                slide_type = 'title'
            elif node.level == 1:
                slide_type = 'chapter'
            
            slides.append(Slide(
                id=node.id,
                type=slide_type,
                title=node.title,
                content=node.description,
                speakerNotes=node.speaker_notes,
                images=image_dict.get(node.id, []),
                level=node.level
            ))
    
    return Response(data=slides)