from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.api import deps
from app.models.layer import Layer
from app.models.project import Project
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=schemas.LayerList)
async def get_layers(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Obtener capas de un proyecto
    """
    # Verificar que el proyecto pertenezca al usuario
    project_query = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Obtener capas
    query = select(Layer).where(Layer.project_id == project_id).offset(skip).limit(limit)
    result = await db.execute(query)
    layers = result.scalars().all()
    
    return {"layers": layers, "total": len(layers)}

@router.post("/", response_model=schemas.Layer)
async def create_layer(
    *,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    layer_in: schemas.LayerCreate,
) -> Any:
    """
    Crear nueva capa
    """
    # Verificar que el proyecto pertenezca al usuario
    project_query = select(Project).where(
        Project.id == layer_in.project_id, 
        Project.user_id == current_user.id
    )
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Crear capa
    layer = Layer(
        project_id=layer_in.project_id,
        name=layer_in.name,
        visible=layer_in.visible,
        locked=layer_in.locked,
        color=layer_in.color,
        order=layer_in.order,
    )
    db.add(layer)
    await db.commit()
    await db.refresh(layer)
    
    return layer