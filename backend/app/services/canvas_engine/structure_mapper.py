from typing import List, Dict, Any
from app.models import CanvasNode

class StructureMapper:
    """节点结构到PPT页面的映射"""
    
    def map_nodes_to_slides(self, nodes: List[CanvasNode]) -> List[Dict[str, Any]]:
        """将节点结构映射为PPT页面结构"""
        # 按层级排序节点
        nodes_by_level = {}
        for node in nodes:
            if node.level not in nodes_by_level:
                nodes_by_level[node.level] = []
            nodes_by_level[node.level].append(node)
        
        # 按顺序排序每个层级的节点
        for level in nodes_by_level:
            nodes_by_level[level].sort(key=lambda x: x.order)
        
        # 构建幻灯片列表
        slides = []
        
        # 根节点映射为标题页
        if 0 in nodes_by_level:
            root_nodes = nodes_by_level[0]
            for root_node in root_nodes:
                slides.append({
                    "type": "title",
                    "node_id": root_node.id,
                    "title": root_node.title,
                    "content": root_node.description,
                    "speaker_notes": root_node.speaker_notes,
                    "order": len(slides)
                })
        
        # 一级节点映射为章节分隔页
        if 1 in nodes_by_level:
            chapter_nodes = nodes_by_level[1]
            for chapter_node in chapter_nodes:
                slides.append({
                    "type": "chapter",
                    "node_id": chapter_node.id,
                    "title": chapter_node.title,
                    "content": chapter_node.description,
                    "speaker_notes": chapter_node.speaker_notes,
                    "order": len(slides)
                })
                
                # 二级节点映射为内容页
                if 2 in nodes_by_level:
                    content_nodes = [n for n in nodes_by_level[2] if n.parent_id == chapter_node.id]
                    for content_node in content_nodes:
                        slide = {
                            "type": "content",
                            "node_id": content_node.id,
                            "title": content_node.title,
                            "content": content_node.description,
                            "speaker_notes": content_node.speaker_notes,
                            "order": len(slides)
                        }
                        
                        # 三级节点映射为内容页内的要点列表
                        if 3 in nodes_by_level:
                            point_nodes = [n for n in nodes_by_level[3] if n.parent_id == content_node.id]
                            if point_nodes:
                                slide["points"] = [
                                    {
                                        "title": point.title,
                                        "content": point.description
                                    }
                                    for point in point_nodes
                                ]
                        
                        slides.append(slide)
        
        return slides
    
    def map_slides_to_nodes(self, slides: List[Dict[str, Any]], project_id: str) -> List[Dict[str, Any]]:
        """将PPT页面结构映射为节点结构"""
        nodes = []
        parent_map = {}
        
        for slide in slides:
            node_type = "root" if slide["type"] == "title" else "chapter" if slide["type"] == "chapter" else "content"
            
            node = {
                "id": slide.get("node_id", None),
                "type": node_type,
                "parentId": None,
                "data": {
                    "title": slide["title"],
                    "description": slide.get("content", ""),
                    "speakerNotes": slide.get("speaker_notes", ""),
                    "images": [],
                    "aiDescriptionEnabled": False,
                    "order": slide["order"],
                    "level": 0 if slide["type"] == "title" else 1 if slide["type"] == "chapter" else 2
                },
                "position": {"x": 0, "y": 0}
            }
            
            # 保存节点ID到父映射
            if node["id"]:
                parent_map[node_type] = node["id"]
            
            # 处理三级节点（要点）
            if slide.get("points"):
                for i, point in enumerate(slide["points"]):
                    point_node = {
                        "id": None,
                        "type": "content",
                        "parentId": node["id"],
                        "data": {
                            "title": point["title"],
                            "description": point.get("content", ""),
                            "speakerNotes": "",
                            "images": [],
                            "aiDescriptionEnabled": False,
                            "order": i,
                            "level": 3
                        },
                        "position": {"x": 0, "y": 0}
                    }
                    nodes.append(point_node)
            
            nodes.append(node)
        
        return nodes