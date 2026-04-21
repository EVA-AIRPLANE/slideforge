from pydantic import BaseModel, Field
from typing import Optional

class ExportRequest(BaseModel):
    """导出请求"""
    project_id: str
    export_type: str = Field(..., pattern="^(pptx|pdf|image)$")

class ExportResponse(BaseModel):
    """导出响应"""
    task_id: str
    status: str  # pending / processing / completed / failed
    download_url: Optional[str] = None