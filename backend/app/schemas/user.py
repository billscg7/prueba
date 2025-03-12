from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Propiedades compartidas
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False


# Propiedades al crear un usuario
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str


# Propiedades al actualizar un usuario
class UserUpdate(UserBase):
    password: Optional[str] = None


# Propiedades al consultar un usuario
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Información completa al devolver un usuario
class User(UserInDBBase):
    pass


# Información adicional almacenada en la base de datos
class UserInDB(UserInDBBase):
    hashed_password: str