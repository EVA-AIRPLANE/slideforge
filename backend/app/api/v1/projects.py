from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.common import Response, Pagination
from app.models.project import Project

router = APIRouter()

@router.post("/", response_model=Response[ProjectResponse])
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """创建项目"""
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return Response(data=db_project)

@router.get("/", response_model=Response[Pagination[ProjectResponse]])
def list_projects(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    """项目列表"""
    total = db.query(Project).count()
    items = db.query(Project).offset((page - 1) * page_size).limit(page_size).all()
    pagination = Pagination(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )
    return Response(data=pagination)

@router.get("/{id}", response_model=Response[ProjectResponse])
def get_project(id: str, db: Session = Depends(get_db)):
    """项目详情"""
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return Response(data=project)

@router.put("/{id}", response_model=Response[ProjectResponse])
def update_project(id: str, project: ProjectUpdate, db: Session = Depends(get_db)):
    """更新项目"""
    db_project = db.query(Project).filter(Project.id == id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="项目不存在")
    update_data = project.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    db.commit()
    db.refresh(db_project)
    return Response(data=db_project)

@router.delete("/{id}", response_model=Response)
def delete_project(id: str, db: Session = Depends(get_db)):
    """删除项目"""
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    db.delete(project)
    db.commit()
    return Response()