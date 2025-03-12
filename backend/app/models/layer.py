from typing import List

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base


class Layer(Base):
    """
    Modelo para capas en un proyecto
    """
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    name = Column(String, nullable=False)
    visible = Column(Boolean, default=True)
    locked = Column(Boolean, default=False)
    color = Column(String, default="#000000")  # Color por defecto para elementos en esta capa
    order = Column(Integer, default=0)  # Orden de renderizado (mayor = encima)
    
    # Relaciones
    project: Mapped["Project"] = relationship("Project", back_populates="layers")
    elements: Mapped[List["Element"]] = relationship("Element", back_populates="layer")