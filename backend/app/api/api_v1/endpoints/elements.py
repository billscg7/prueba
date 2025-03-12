from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.api import deps
from app.models.element import Element
from app.models.project import Project
from app.models.layer import Layer
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=schemas.ElementList)
async def get_elements(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    layer_id: int = None,
    element_type: str = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Obtener elementos de un proyecto
    """
    # Verificar que el proyecto pertenezca al usuario
    project_query = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Construir query base
    query = select(Element).where(Element.project_id == project_id)
    
    # Aplicar filtros adicionales
    if layer_id:
        query = query.where(Element.layer_id == layer_id)
    
    if element_type:
        query = query.where(Element.type == element_type)
    
    # Paginación
    query = query.offset(skip).limit(limit)
    
    # Ejecutar query
    result = await db.execute(query)
    elements = result.scalars().all()
    
    # Contar total (sin paginación)
    count_query = select(Element).where(Element.project_id == project_id)
    if layer_id:
        count_query = count_query.where(Element.layer_id == layer_id)
    if element_type:
        count_query = count_query.where(Element.type == element_type)
    
    count_result = await db.execute(count_query)
    total = len(count_result.scalars().all())
    
    return {"elements": elements, "total": total}

@router.post("/", response_model=schemas.Element)
async def create_element(
    *,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    element_in: schemas.ElementCreate,
) -> Any:
    """
    Crear nuevo elemento
    """
    # Verificar que el proyecto pertenezca al usuario
    project_query = select(Project).where(
        Project.id == element_in.project_id, 
        Project.user_id == current_user.id
    )
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Verificar que la capa exista y pertenezca al proyecto
    layer_query = select(Layer).where(
        Layer.id == element_in.layer_id,
        Layer.project_id == element_in.project_id
    )
    layer_result = await db.execute(layer_query)
    layer = layer_result.scalar_one_or_none()
    
    if not layer:
        raise HTTPException(status_code=404, detail="Capa no encontrada")
    
    # Crear elemento
    element = Element(
        project_id=element_in.project_id,
        layer_id=element_in.layer_id,
        type=element_in.type,
        geometry=element_in.geometry,
        style=element_in.style,
        selected=element_in.selected,
        locked=element_in.locked,
        metadata=element_in.metadata or {},
    )
    db.add(element)
    await db.commit()
    await db.refresh(element)
    
    return element