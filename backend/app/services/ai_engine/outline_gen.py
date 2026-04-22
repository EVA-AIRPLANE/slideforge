from app.services.ai_engine.zhipu_client import zhipu_client

def generate_outline(topic: str, preferences: dict) -> dict:
    """生成大纲并返回画布节点结构"""
    return zhipu_client.generate_outline(topic, preferences)
