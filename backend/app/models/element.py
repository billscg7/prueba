from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func

from app.db.base_class import Base


class Element(Base):
    """
    Modelo para elementos de dibujo
    """
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    layer_id = Column(Integer, ForeignKey("layer.id"), nullable=False)
    
    # Tipo de elemento (line, polyline, rectangle, circle, arc, text, etc.)
    type = Column(String, nullable=False, index=True)
    
    # Geometría y propiedades específicas del elemento
    # Almacenado como JSON para flexibilidad
    geometry = Column(JSON, nullable=False)
    
    # Propiedades de estilo
    style = Column(JSON, nullable=False)
    
    # Estado
    selected = Column(Boolean, default=False)
    locked = Column(Boolean, default=False)
    
    # Metadatos adicionales
    metadata = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relaciones
    project: Mapped["Project"] = relationship("Project", back_populates="elements")
    layer: Mapped["Layer"] = relationship("Layer", back_populates="elements")