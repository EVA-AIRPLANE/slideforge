import requests
from typing import List, Dict, Any
from app.core.config import settings

def search_images(keyword: str, per_page: int = 5) -> List[Dict[str, Any]]:
    """使用Pexels API搜索图片"""
    api_key = settings.PEXELS_API_KEY
    if not api_key:
        # 返回默认图片列表
        return [
            {
                "url": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
                "thumbnail": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&h=350",
                "photographer": "Pixabay"
            },
            {
                "url": "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg",
                "thumbnail": "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&h=350",
                "photographer": "Negative Space"
            }
        ]
    url = "https://api.pexels.com/v1/search"
    headers = {
        "Authorization": api_key
    }
    params = {
        "query": keyword,
        "per_page": per_page,
        "locale": "zh-CN"
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        photos = data.get("photos", [])
        return [
            {
                "url": photo["src"]["large"],
                "thumbnail": photo["src"]["small"],
                "photographer": photo["photographer"]
            }
            for photo in photos
        ]
    except Exception as e:
        print(f"Pexels API调用失败: {e}")
        # 返回默认图片
        return [
            {
                "url": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
                "thumbnail": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&h=350",
                "photographer": "Pixabay"
            }
        ]
