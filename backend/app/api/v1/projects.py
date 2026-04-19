from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_active_user
from app.models import User, Project
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, BaseResponse, PaginatedResponse

router = APIRouter(prefix="/projects", tags=["项目管理"])


@router.post("", response_model=BaseResponse)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建项目"""
    db_project = Project(
        name=project_in.name,
        mode=project_in.mode,
        template_id=project_in.template_id,
        user_id=str(current_user.id)
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return BaseResponse(
        data=ProjectResponse.from_orm(db_project).dict()
    )


@router.get("", response_model=PaginatedResponse)
def list_projects(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """项目列表"""
    projects = db.query(Project).filter(
        Project.user_id == str(current_user.id)
    ).offset(skip).limit(limit).all()
    
    total = db.query(Project).filter(
        Project.user_id == str(current_user.id)
    ).count()
    
    return PaginatedResponse(
        data={
            "items": [ProjectResponse.from_orm(p).dict() for p in projects],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit
        }
    )


@router.get("/{project_id}", response_model=BaseResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """项目详情"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == str(current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    return BaseResponse(
        data=ProjectResponse.from_orm(project).dict()
    )


@router.put("/{project_id}", response_model=BaseResponse)
def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == str(current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    # 更新项目信息
    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return BaseResponse(
        data=ProjectResponse.from_orm(project).dict()
    )


@router.delete("/{project_id}", response_model=BaseResponse)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == str(current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    db.delete(project)
    db.commit()
    
    return BaseResponse(
        message="项目删除成功"
    )
