from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, projects, layers, elements

api_router = APIRouter()

# Incluir los diferentes routers por funcionalidad
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(layers.router, prefix="/layers", tags=["layers"])
api_router.include_router(elements.router, prefix="/elements", tags=["elements"])