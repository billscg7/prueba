from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func

from app.db.base_class import Base


class User(Base):
    """
    Modelo para usuarios del sistema
    """
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relaciones
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")