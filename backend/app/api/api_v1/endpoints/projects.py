from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.api import deps
from app.models.project import Project
from app.models.project_setting import ProjectSettings
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Project])
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Obtener proyectos del usuario actual
    """
    query = select(Project).where(Project.user_id == current_user.id).offset(skip).limit(limit)
    result = await db.execute(query)
    projects = result.scalars().all()
    return projects

@router.post("/", response_model=schemas.Project)
async def create_project(
    *,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    project_in: schemas.ProjectCreate,
) -> Any:
    """
    Crear nuevo proyecto
    """
    project = Project(
        user_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Crear configuración por defecto para el proyecto
    settings = ProjectSettings(
        project_id=project.id,
        unit_system="metric",
        grid_spacing=1.0,
        grid_subdivisions=10,
        grid_visible=True,
        axes_visible=True,
        snap_to_grid=True,
    )
    db.add(settings)
    await db.commit()
    
    return project

@router.get("/{id}", response_model=schemas.ProjectWithSettings)
async def get_project(
    *,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    id: int,
) -> Any:
    """
    Obtener proyecto por ID
    """
    query = select(Project).where(Project.id == id, Project.user_id == current_user.id)
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Obtener configuración
    settings_query = select(ProjectSettings).where(ProjectSettings.project_id == id)
    settings_result = await db.execute(settings_query)
    settings = settings_result.scalar_one_or_none()
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "user_id": project.user_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "settings": settings
    }