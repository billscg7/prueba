from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


# Propiedades compartidas para proyectos
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


# Propiedades para crear un proyecto
class ProjectCreate(ProjectBase):
    pass


# Propiedades para actualizar un proyecto
class ProjectUpdate(ProjectBase):
    name: Optional[str] = None


# Propiedades para configuración del proyecto
class ProjectSettingsBase(BaseModel):
    unit_system: Optional[str] = "metric"
    grid_spacing: Optional[float] = 1.0
    grid_subdivisions: Optional[int] = 10
    grid_visible: Optional[bool] = True
    axes_visible: Optional[bool] = True
    snap_to_grid: Optional[bool] = True
    ui_theme: Optional[str] = "light"
    grid_color: Optional[str] = "#CCCCCC"
    background_color: Optional[str] = "#FFFFFF"
    advanced_settings: Optional[Dict[str, Any]] = {}


# Propiedades para crear configuración del proyecto
class ProjectSettingsCreate(ProjectSettingsBase):
    project_id: int


# Propiedades para actualizar configuración del proyecto
class ProjectSettingsUpdate(ProjectSettingsBase):
    pass


# Propiedades comunes para la respuesta de configuración
class ProjectSettingsInDBBase(ProjectSettingsBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True


# Respuesta de configuración del proyecto
class ProjectSettings(ProjectSettingsInDBBase):
    pass


# Propiedades comunes para la respuesta de proyecto
class ProjectInDBBase(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Respuesta básica del proyecto
class Project(ProjectInDBBase):
    pass


# Respuesta detallada del proyecto que incluye configuración
class ProjectWithSettings(Project):
    settings: Optional[ProjectSettings] = None