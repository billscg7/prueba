from typing import Any

from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    id: Any
    __name__: str
    
    # Generar nombre de tabla automáticamente a partir del nombre de la clase
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()