from app.services.ai_engine.zhipu_client import zhipu_client

def understand_image(image_url: str, node_title: str, parent_title: str, siblings: list) -> str:
    """理解图片内容并生成描述"""
    return zhipu_client.understand_image(image_url, node_title, parent_title, siblings)
