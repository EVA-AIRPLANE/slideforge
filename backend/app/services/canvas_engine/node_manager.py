from sqlalchemy.orm import Session
from app.models import CanvasNode, NodeImage
import uuid
from typing import Dict, Any, Optional

class NodeManager:
    def __init__(self, db: Session):
        self.db = db
    
    def create_node(
        self,
        project_id: str,
        node_type: str,
        parent_id: Optional[str] = None,
        data: Dict[str, Any] = None,
        position: Dict[str, float] = None
    ) -> CanvasNode:
        """创建节点"""
        # 计算层级
        level = 0
        if parent_id:
            parent_node = self.db.query(CanvasNode).filter(CanvasNode.id == parent_id).first()
            if parent_node:
                level = parent_node.level + 1
        
        # 创建节点
        node = CanvasNode(
            id=str(uuid.uuid4()),
            project_id=project_id,
            parent_id=parent_id,
            node_type=node_type,
            title=data.get('title', ''),
            description=data.get('description', ''),
            speaker_notes=data.get('speakerNotes', ''),
            order=data.get('order', 0),
            level=level,
            ai_description_enabled=data.get('aiDescriptionEnabled', False),
            ai_generated=data.get('aiGenerated', False),
            position=position or {"x": 0, "y": 0}
        )
        
        self.db.add(node)
        self.db.commit()
        self.db.refresh(node)
        
        return node
    
    def update_node(
        self,
        node_id: str,
        data: Dict[str, Any] = None,
        position: Dict[str, float] = None
    ) -> CanvasNode:
        """更新节点"""
        node = self.db.query(CanvasNode).filter(CanvasNode.id == node_id).first()
        if not node:
            raise ValueError("节点不存在")
        
        # 更新节点数据
        if data:
            if 'title' in data:
                node.title = data['title']
            if 'description' in data:
                node.description = data['description']
            if 'speakerNotes' in data:
                node.speaker_notes = data['speakerNotes']
            if 'aiDescriptionEnabled' in data:
                node.ai_description_enabled = data['aiDescriptionEnabled']
            if 'aiGenerated' in data:
                node.ai_generated = data['aiGenerated']
            if 'order' in data:
                node.order = data['order']
        
        # 更新位置
        if position:
            node.position = position
        
        self.db.commit()
        self.db.refresh(node)
        
        return node
    
    def delete_node(self, node_id: str) -> None:
        """删除节点及其所有子节点"""
        # 递归获取所有子节点
        def get_all_child_nodes(node_id: str) -> list:
            child_nodes = self.db.query(CanvasNode).filter(CanvasNode.parent_id == node_id).all()
            all_nodes = [node_id]
            for child in child_nodes:
                all_nodes.extend(get_all_child_nodes(child.id))
            return all_nodes
        
        # 获取所有要删除的节点
        nodes_to_delete = get_all_child_nodes(node_id)
        
        # 删除节点图片
        for node_id_to_delete in nodes_to_delete:
            images = self.db.query(NodeImage).filter(NodeImage.node_id == node_id_to_delete).all()
            for image in images:
                self.db.delete(image)
        
        # 删除节点
        for node_id_to_delete in nodes_to_delete:
            node = self.db.query(CanvasNode).filter(CanvasNode.id == node_id_to_delete).first()
            if node:
                self.db.delete(node)
        
        self.db.commit()
    
    def reorder_node(
        self,
        node_id: str,
        new_parent_id: Optional[str] = None,
        new_order: Optional[int] = None
    ) -> None:
        """调整节点顺序/层级"""
        node = self.db.query(CanvasNode).filter(CanvasNode.id == node_id).first()
        if not node:
            raise ValueError("节点不存在")
        
        # 更新父节点
        if new_parent_id is not None:
            # 检查父节点是否存在
            if new_parent_id:
                parent_node = self.db.query(CanvasNode).filter(CanvasNode.id == new_parent_id).first()
                if not parent_node:
                    raise ValueError("父节点不存在")
                # 更新层级
                node.parent_id = new_parent_id
                node.level = parent_node.level + 1
            else:
                # 设为根节点
                node.parent_id = None
                node.level = 0
        
        # 更新顺序
        if new_order is not None:
            node.order = new_order
        
        self.db.commit()
    
    def get_node(self, node_id: str) -> Optional[CanvasNode]:
        """获取节点"""
        return self.db.query(CanvasNode).filter(CanvasNode.id == node_id).first()
    
    def get_nodes_by_project(self, project_id: str) -> list:
        """获取项目的所有节点"""
        return self.db.query(CanvasNode).filter(CanvasNode.project_id == project_id).all()
    
    def get_child_nodes(self, node_id: str) -> list:
        """获取节点的所有子节点"""
        return self.db.query(CanvasNode).filter(CanvasNode.parent_id == node_id).all()