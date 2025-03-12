from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base


class ProjectSettings(Base):
    """
    Modelo para configuración de proyectos
    """
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), unique=True, nullable=False)
    
    # Configuración de unidades y medidas
    unit_system = Column(String, default="metric")  # metric o imperial
    grid_spacing = Column(Float, default=1.0)  # metros o pies
    grid_subdivisions = Column(Integer, default=10)
    
    # Preferencias de visualización
    grid_visible = Column(Boolean, default=True)
    axes_visible = Column(Boolean, default=True)
    snap_to_grid = Column(Boolean, default=True)
    
    # Configuración de colores
    ui_theme = Column(String, default="light")  # light o dark
    grid_color = Column(String, default="#CCCCCC")
    background_color = Column(String, default="#FFFFFF")
    
    # Configuración avanzada (como JSON para flexibilidad)
    advanced_settings = Column(JSON, default={})
    
    # Relaciones
    project: Mapped["Project"] = relationship("Project", back_populates="settings")