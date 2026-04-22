from app.services.ai_engine.zhipu_client import zhipu_client

def generate_content(topic: str, context: str) -> str:
    """生成内容"""
    return zhipu_client.generate_content_with_search(topic, context)
