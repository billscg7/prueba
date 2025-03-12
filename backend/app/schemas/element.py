from datetime import datetime
from typing import Optional, Dict, Any, List, Union

from pydantic import BaseModel, Field


# Geometría y coordenadas
class Point(BaseModel):
    x: float
    y: float


# Esquemas para geometrías específicas
class LineGeometry(BaseModel):
    start: Point
    end: Point


class PolylineGeometry(BaseModel):
    points: List[Point]
    closed: bool = False


class RectangleGeometry(BaseModel):
    topLeft: Point
    width: float
    height: float
    rotation: float = 0


class CircleGeometry(BaseModel):
    center: Point
    radius: float


class ArcGeometry(BaseModel):
    center: Point
    radius: float
    startAngle: float
    endAngle: float


class TextGeometry(BaseModel):
    position: Point
    content: str
    fontSize: float = 12
    fontFamily: str = "Arial"
    rotation: float = 0
    horizontalAlign: str = "left"  # left, center, right
    verticalAlign: str = "middle"  # top, middle, bottom


# Unión de todos los tipos de geometría
Geometry = Union[
    LineGeometry, 
    PolylineGeometry, 
    RectangleGeometry, 
    CircleGeometry, 
    ArcGeometry, 
    TextGeometry
]


# Propiedades de estilo
class ElementStyle(BaseModel):
    strokeColor: str
    strokeWidth: float
    lineType: str  # solid, dashed, etc.
    fillColor: str
    fillOpacity: float


# Propiedades base para elementos
class ElementBase(BaseModel):
    type: str  # line, polyline, rectangle, circle, arc, text
    layer_id: int
    geometry: Dict[str, Any]  # Geometría específica del tipo
    style: ElementStyle
    selected: Optional[bool] = False
    locked: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = {}


# Propiedades para crear un elemento
class ElementCreate(ElementBase):
    project_id: int


# Propiedades para actualizar un elemento
class ElementUpdate(BaseModel):
    type: Optional[str] = None
    layer_id: Optional[int] = None
    geometry: Optional[Dict[str, Any]] = None
    style: Optional[ElementStyle] = None
    selected: Optional[bool] = None
    locked: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


# Propiedades comunes para la respuesta de elementos
class ElementInDBBase(ElementBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Respuesta de elemento
class Element(ElementInDBBase):
    pass


# Respuesta con lista de elementos
class ElementList(BaseModel):
    elements: List[Element]
    total: int


# Bulk operations
class ElementBulkCreate(BaseModel):
    elements: List[ElementCreate]


class ElementBulkUpdate(BaseModel):
    elements: List[Dict[str, Any]]  # id + campos a actualizar


class ElementBulkDelete(BaseModel):
    ids: List[int]