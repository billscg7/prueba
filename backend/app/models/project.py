from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func

from app.db.base_class import Base


class Project(Base):
    """
    Modelo para proyectos
    """
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="projects")
    settings: Mapped["ProjectSettings"] = relationship("ProjectSettings", back_populates="project", uselist=False)
    layers: Mapped[List["Layer"]] = relationship("Layer", back_populates="project", cascade="all, delete-orphan")
    elements: Mapped[List["Element"]] = relationship("Element", back_populates="project", cascade="all, delete-orphan")