from typing import List, Dict, Any, Tuple
from app.models import CanvasNode

class AutoLayout:
    """节点自动布局算法"""
    
    def __init__(self):
        self.node_width = 250  # 节点宽度
        self.node_height = 150  # 节点高度
        self.horizontal_spacing = 100  # 水平间距
        self.vertical_spacing = 80  # 垂直间距
    
    def layout_nodes(self, nodes: List[CanvasNode]) -> List[CanvasNode]:
        """对节点进行自动布局"""
        # 构建节点树
        node_tree = self._build_node_tree(nodes)
        
        # 计算布局
        positions = self._calculate_positions(node_tree)
        
        # 更新节点位置
        for node in nodes:
            if node.id in positions:
                node.position = positions[node.id]
        
        return nodes
    
    def _build_node_tree(self, nodes: List[CanvasNode]) -> Dict[str, Dict[str, Any]]:
        """构建节点树结构"""
        node_dict = {node.id: node for node in nodes}
        tree = {}
        
        # 首先找到根节点
        for node in nodes:
            if not node.parent_id:
                tree[node.id] = {
                    "node": node,
                    "children": []
                }
        
        # 然后添加子节点
        for node in nodes:
            if node.parent_id and node.parent_id in tree:
                tree[node.parent_id]["children"].append({
                    "node": node,
                    "children": []
                })
        
        # 递归构建完整的树
        def build_children(parent_id, parent_node):
            for child in parent_node["children"]:
                child_id = child["node"].id
                # 添加子节点的子节点
                for node in nodes:
                    if node.parent_id == child_id:
                        child["children"].append({
                            "node": node,
                            "children": []
                        })
                # 递归处理
                build_children(child_id, child)
        
        for root_id in tree:
            build_children(root_id, tree[root_id])
        
        return tree
    
    def _calculate_positions(self, node_tree: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """计算节点位置"""
        positions = {}
        x_offset = 0
        
        # 对每个根节点进行布局
        for root_id in node_tree:
            root_node = node_tree[root_id]
            # 计算子树的宽度和高度
            width, height = self._calculate_tree_size(root_node)
            # 布局子树
            self._layout_subtree(root_node, x_offset, 0, positions)
            # 更新下一个根节点的x偏移
            x_offset += width + self.horizontal_spacing
        
        return positions
    
    def _calculate_tree_size(self, node: Dict[str, Any]) -> Tuple[float, float]:
        """计算子树的宽度和高度"""
        if not node["children"]:
            return self.node_width, self.node_height
        
        # 计算子节点的宽度和高度
        child_widths = []
        child_heights = []
        
        for child in node["children"]:
            width, height = self._calculate_tree_size(child)
            child_widths.append(width)
            child_heights.append(height)
        
        # 子树的宽度是所有子节点宽度之和加上间距
        width = sum(child_widths) + (len(child_widths) - 1) * self.horizontal_spacing
        # 子树的高度是父节点高度加上最高子节点的高度加上间距
        height = self.node_height + max(child_heights) + self.vertical_spacing
        
        return width, height
    
    def _layout_subtree(self, node: Dict[str, Any], x: float, y: float, positions: Dict[str, Dict[str, float]]):
        """布局子树"""
        # 设置当前节点的位置
        positions[node["node"].id] = {
            "x": x,
            "y": y
        }
        
        if not node["children"]:
            return
        
        # 计算子节点的总宽度
        total_width = 0
        child_widths = []
        
        for child in node["children"]:
            width, _ = self._calculate_tree_size(child)
            child_widths.append(width)
            total_width += width
        
        # 计算子节点的起始x位置
        start_x = x - total_width / 2
        current_x = start_x
        
        # 布局子节点
        for i, child in enumerate(node["children"]):
            # 计算子节点的x位置
            child_x = current_x + child_widths[i] / 2
            # 计算子节点的y位置
            child_y = y + self.node_height + self.vertical_spacing
            # 布局子节点
            self._layout_subtree(child, child_x, child_y, positions)
            # 更新当前x位置
            current_x += child_widths[i] + self.horizontal_spacing