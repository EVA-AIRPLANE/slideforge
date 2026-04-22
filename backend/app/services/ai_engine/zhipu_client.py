import requests
import json
from typing import Optional, Dict, Any
from app.core.config import settings

class ZhipuAIClient:
    def __init__(self):
        self.api_key = settings.ZHIPU_API_KEY
        self.base_url = "https://ark.cn-beijing.volces.com/api/v3"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    def generate_content_with_search(self, topic: str, context: str) -> str:
        """联网搜索 + 文案生成，一步完成"""
        if not self.api_key:
            return "请配置智谱API密钥"
        payload = {
            "model": "glm-4-flashx",
            "messages": [
                {"role": "system", "content": "你是一个专业的PPT文案撰写助手。请搜索相关资料并生成适合PPT展示的文案。"},
                {"role": "user", "content": f"主题：{topic}\n上下文：{context}"}
            ],
            "tools": [{
                "type": "web_search",
                "web_search": {"enable": True}
            }],
            "temperature": 0.7,
            "max_tokens": 500
        }
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                data=json.dumps(payload)
            )
            response.raise_for_status()
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"智谱API调用失败: {e}")
            return "AI生成失败，请稍后重试"
    def generate_outline(self, topic: str, preferences: dict) -> dict:
        """生成大纲并返回画布节点结构"""
        if not self.api_key:
            return {"nodes": []}
        payload = {
            "model": "glm-4-flashx",
            "messages": [
                {"role": "system", "content": "你是一个PPT大纲生成助手。请根据主题生成结构化大纲，返回JSON格式的节点树。节点树应包含id、title、level、order等字段，根节点level为0，一级节点level为1，以此类推。"},
                {"role": "user", "content": f"主题：{topic}\n偏好：{preferences}"}
            ],
            "tools": [{
                "type": "web_search",
                "web_search": {"enable": True}
            }],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                data=json.dumps(payload)
            )
            response.raise_for_status()
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            # 尝试解析JSON内容
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # 如果返回的不是JSON，生成一个默认的大纲结构
                return {
                    "nodes": [
                        {"id": "root", "title": topic, "level": 0, "order": 0},
                        {"id": "node-1", "title": "背景介绍", "level": 1, "order": 0, "parentId": "root"},
                        {"id": "node-2", "title": "主要内容", "level": 1, "order": 1, "parentId": "root"},
                        {"id": "node-3", "title": "总结", "level": 1, "order": 2, "parentId": "root"}
                    ]
                }
        except Exception as e:
            print(f"大纲生成失败: {e}")
            return {"nodes": []}
    def understand_image(self, image_url: str, node_title: str, parent_title: str, siblings: list) -> str:
        """图片理解（GLM-4.6V-Flash）"""
        if not self.api_key:
            return "请配置智谱API密钥"
        payload = {
            "model": "glm-4.6v-flash",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"这是一张属于PPT章节'{parent_title} > {node_title}'的配图。相邻章节：{', '.join(siblings)}。请描述图片内容，生成50字以内的PPT说明文字。"},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "temperature": 0.7,
            "max_tokens": 200
        }
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                data=json.dumps(payload)
            )
            response.raise_for_status()
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"图片理解失败: {e}")
            return "图片描述生成失败"

# 创建全局客户端实例
zhipu_client = ZhipuAIClient()
