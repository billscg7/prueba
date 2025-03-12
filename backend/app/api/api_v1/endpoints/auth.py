from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.db.session import get_db

router = APIRouter()


@router.post("/access-token", response_model=schemas.Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    Obtiene un token de acceso OAuth2 (JWT)
    """
    # Buscar usuario por username
    query = "SELECT * FROM users WHERE username = :username"
    result = await db.execute(query, {"username": form_data.username})
    user = result.scalar_one_or_none()
    
    if not user:
        # Si no se encuentra, buscar por email
        query = "SELECT * FROM users WHERE email = :email"
        result = await db.execute(query, {"email": form_data.username})
        user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
        )
    
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cuenta inactiva",
        )
    
    # Crear token de acceso con expiración configurada
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.User)
async def register_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Registra un nuevo usuario
    """
    # Verificar si el usuario ya existe (email o username)
    query = """
    SELECT * FROM users 
    WHERE email = :email OR username = :username
    """
    result = await db.execute(
        query, 
        {"email": user_in.email, "username": user_in.username}
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario con este email o nombre de usuario ya existe",
        )
    
    # Crear nuevo usuario
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user