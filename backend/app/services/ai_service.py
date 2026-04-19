import os
import httpx
import json
from typing import List, Dict, Any, Optional
from zhipuai import ZhipuAI
from app.config import settings


class AIService:
    """AI服务类，封装智谱AI和Pexels API的调用"""
    
    def __init__(self):
        self.zhipu_client = ZhipuAI(api_key=settings.ZHIPU_API_KEY)
        self.pexels_api_key = settings.PEXELS_API_KEY
    
    async def generate_outline(self, topic: str, preferences: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """生成PPT大纲"""
        prompt = f"""请为以下主题生成一个PPT大纲，包含5-8个章节：
主题：{topic}

请以JSON格式返回，格式如下：
{{
  "nodes": [
    {{
      "id": "1",
      "type": "chapter",
      "title": "章节标题",
      "children": [
        {{
          "id": "1-1",
          "type": "material",
          "title": "内容标题",
          "description": "内容描述"
        }}
      ]
    }}
  ]
}}

只返回JSON，不要其他文字。"""
        
        try:
            response = self.zhipu_client.chat.completions.create(
                model="glm-4-flashx",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            # 尝试解析JSON
            try:
                result = json.loads(content)
                if "nodes" in result:
                    return result["nodes"]
            except json.JSONDecodeError:
                # 如果不是完整JSON，尝试提取JSON部分
                import re
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    result = json.loads(json_match.group(0))
                    if "nodes" in result:
                        return result["nodes"]
            
            # 如果解析失败，返回默认结构
            return [
                {
                    "id": "1",
                    "type": "chapter",
                    "title": topic,
                    "children": [
                        {
                            "id": "1-1",
                            "type": "material",
                            "title": "简介",
                            "description": f"{topic}的基本介绍"
                        }
                    ]
                }
            ]
        except Exception as e:
            print(f"生成大纲失败: {e}")
            # 返回默认结构
            return [
                {
                    "id": "1",
                    "type": "chapter",
                    "title": topic,
                    "children": [
                        {
                            "id": "1-1",
                            "type": "material",
                            "title": "简介",
                            "description": f"{topic}的基本介绍"
                        }
                    ]
                }
            ]
    
    async def generate_content(self, topic: str, context: Optional[str] = None) -> str:
        """为节点生成内容描述"""
        prompt = f"""请为以下PPT节点生成一段100-200字的内容描述：
节点标题：{topic}
上下文：{context or '无'}

请提供一段自然流畅的描述性文字。"""
        
        try:
            response = self.zhipu_client.chat.completions.create(
                model="glm-4-flashx",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"生成内容失败: {e}")
            return f"{topic}的详细内容介绍"
    
    async def search_images(self, keyword: str, per_page: int = 5) -> List[Dict[str, Any]]:
        """使用Pexels API搜索图片"""
        if not self.pexels_api_key or self.pexels_api_key == "your_pexels_api_key":
            # 如果没有API key，返回示例图片
            return [
                {
                    "id": 1,
                    "url": "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg",
                    "thumbnail": "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?w=400&h=300&fit=crop",
                    "photographer": "Example"
                }
            ]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.pexels.com/v1/search",
                    params={"query": keyword, "per_page": per_page},
                    headers={"Authorization": self.pexels_api_key},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return [
                        {
                            "id": photo["id"],
                            "url": photo["src"]["original"],
                            "thumbnail": photo["src"]["medium"],
                            "photographer": photo["photographer"]
                        }
                        for photo in data.get("photos", [])
                    ]
        except Exception as e:
            print(f"搜索图片失败: {e}")
        
        # 失败时返回示例图片
        return [
            {
                "id": 1,
                "url": "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg",
                "thumbnail": "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?w=400&h=300&fit=crop",
                "photographer": "Example"
            }
        ]
    
    async def understand_image(self, image_url: str, node_title: str, parent_title: str, siblings: List[str]) -> str:
        """使用GLM-4V理解图片并生成描述"""
        try:
            response = self.zhipu_client.chat.completions.create(
                model="glm-4v-flash",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"""请描述这张图片，使其适合作为PPT中的配图。
上下文信息：
- 幻灯片标题：{node_title}
- 章节标题：{parent_title}
- 同级幻灯片：{', '.join(siblings)}

请生成一段50-100字的描述，突出图片与幻灯片主题的关联。"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"图片理解失败: {e}")
            return f"与{node_title}相关的配图"


# 创建AI服务单例
ai_service = AIService()
