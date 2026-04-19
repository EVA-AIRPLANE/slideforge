import os
import uuid
from typing import Dict, Any
from fastapi import UploadFile
import shutil

class AssetStore:
    """资产存储服务"""
    
    def __init__(self):
        self.base_path = "assets"
        # 创建基础目录
        os.makedirs(self.base_path, exist_ok=True)
    
    async def upload_image(self, file: UploadFile, project_id: str, node_id: str) -> Dict[str, str]:
        """上传图片"""
        # 创建项目和节点目录
        project_dir = os.path.join(self.base_path, project_id)
        node_dir = os.path.join(project_dir, node_id)
        os.makedirs(node_dir, exist_ok=True)
        
        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(node_dir, file_name)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 生成URL
        url = f"/assets/{project_id}/{node_id}/{file_name}"
        thumbnail_url = f"/assets/{project_id}/{node_id}/{file_name}"  # 实际项目中应该生成缩略图
        
        return {
            "url": url,
            "thumbnail": thumbnail_url
        }
    
    def delete_image(self, image_url: str) -> None:
        """删除图片"""
        # 从URL中提取文件路径
        file_path = image_url.replace("/assets/", "assets/")
        
        # 检查文件是否存在
        if os.path.exists(file_path):
            os.remove(file_path)
    
    def get_image_path(self, image_url: str) -> str:
        """获取图片的本地路径"""
        return image_url.replace("/assets/", "assets/")