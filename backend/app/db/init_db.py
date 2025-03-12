import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base_class import Base
from app.db.session import engine, async_session
from app.models.user import User
from app.models.project import Project
from app.models.project_settings import ProjectSettings
from app.models.element import Element
from app.models.layer import Layer
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


async def init_db() -> None:
    async with engine.begin() as conn:
        # Crear tablas
        await conn.run_sync(Base.metadata.create_all)
    
    # Verificar si hay usuarios, si no, crear usuario administrador
    async with async_session() as db:
        user_count = await db.scalar("SELECT COUNT(*) FROM users")
        if user_count == 0:
            logger.info("Creando usuario administrador")
            admin_user = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin"),
                is_superuser=True,
            )
            db.add(admin_user)
            await db.commit()
            
            # Crear un proyecto por defecto para el usuario administrador
            default_project = Project(
                name="Proyecto por defecto",
                description="Proyecto inicial creado automáticamente",
                user_id=admin_user.id,
            )
            db.add(default_project)
            await db.commit()
            
            # Crear configuración por defecto para el proyecto
            default_settings = ProjectSettings(
                project_id=default_project.id,
                unit_system="metric",
                grid_spacing=1.0,
                grid_subdivisions=10,
                grid_visible=True,
                axes_visible=True,
                snap_to_grid=True,
                ui_theme="light",
                grid_color="#CCCCCC",
                background_color="#FFFFFF",
            )
            db.add(default_settings)
            
            # Crear capa por defecto para el proyecto
            default_layer = Layer(
                project_id=default_project.id,
                name="Default",
                visible=True,
                locked=False,
                color="#000000",
                order=0,
            )
            db.add(default_layer)
            await db.commit()