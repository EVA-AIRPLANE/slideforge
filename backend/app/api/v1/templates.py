from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.template import TemplateCreate, TemplateResponse
from app.schemas.common import Response
from app.models.template import Template

router = APIRouter()

@router.post("/projects/{project_id}/template/upload", response_model=Response[TemplateResponse])
def upload_template(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上传模板并解析版式"""
    # 这里应该实现模板上传和解析逻辑
    # 暂时返回一个模拟的模板
    template = Template(
        name=file.filename,
        source="user_upload",
        file_path=f"./data/uploads/templates/{file.filename}",
        layouts="{}"
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return Response(data=template)

@router.get("/projects/{project_id}/template", response_model=Response[TemplateResponse])
def get_template(project_id: str, db: Session = Depends(get_db)):
    """获取当前项目模板信息"""
    # 这里应该实现获取项目模板的逻辑
    # 暂时返回一个模拟的模板
    template = Template(
        name="默认模板",
        source="builtin",
        file_path="./data/uploads/templates/default.pptx",
        layouts="{}"
    )
    return Response(data=template)