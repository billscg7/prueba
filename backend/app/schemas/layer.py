from typing import Optional, List

from pydantic import BaseModel, Field


# Propiedades compartidas para capas
class LayerBase(BaseModel):
    name: str
    visible: Optional[bool] = True
    locked: Optional[bool] = False
    color: Optional[str] = "#000000"
    order: Optional[int] = 0


# Propiedades para crear una capa
class LayerCreate(LayerBase):
    project_id: int


# Propiedades para actualizar una capa
class LayerUpdate(LayerBase):
    name: Optional[str] = None
    project_id: Optional[int] = None


# Propiedades comunes para la respuesta de capa
class LayerInDBBase(LayerBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True


# Respuesta de capa
class Layer(LayerInDBBase):
    pass


# Respuesta con lista de capas
class LayerList(BaseModel):
    layers: List[Layer]
    total: int