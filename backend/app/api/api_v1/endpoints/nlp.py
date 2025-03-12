from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.db.session import get_db
from app.models.user import User
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()

class CommandRequest(BaseModel):
    command: str
    project_id: int

class CommandResponse(BaseModel):
    command: str
    recognized: bool
    action: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/process", response_model=CommandResponse)
async def process_command(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    command_req: CommandRequest,
):
    """
    Procesa un comando en lenguaje natural
    """
    command = command_req.command.lower().strip()
    
    # Implementación básica de procesamiento de comandos
    # En una implementación real, aquí se usaría el modelo NLP
    
    # Ejemplo: "crear línea de 1,1 a 3,3"
    if "crear línea" in command:
        try:
            # Análisis muy simple basado en patrones
            parts = command.split("de")[1].split("a")
            start_coords = parts[0].strip().split(",")
            end_coords = parts[1].strip().split(",")
            
            start_x, start_y = float(start_coords[0]), float(start_coords[1])
            end_x, end_y = float(end_coords[0]), float(end_coords[1])
            
            return {
                "command": command,
                "recognized": True,
                "action": "create_line",
                "params": {
                    "start": {"x": start_x, "y": start_y},
                    "end": {"x": end_x, "y": end_y}
                }
            }
        except Exception as e:
            return {
                "command": command,
                "recognized": False,
                "error": f"No se pudo interpretar el comando: {str(e)}"
            }
    
    # Ejemplo: "crear rectángulo en 1,1 con ancho 2 y alto 3"
    elif "crear rectángulo" in command or "crear rectangulo" in command:
        try:
            position_part = command.split("en")[1].split("con")[0].strip()
            position_coords = position_part.split(",")
            x, y = float(position_coords[0]), float(position_coords[1])
            
            width_part = command.split("ancho")[1].split("y")[0].strip()
            width = float(width_part)
            
            height_part = command.split("alto")[1].strip()
            height = float(height_part)
            
            return {
                "command": command,
                "recognized": True,
                "action": "create_rectangle",
                "params": {
                    "topLeft": {"x": x, "y": y},
                    "width": width,
                    "height": height
                }
            }
        except Exception as e:
            return {
                "command": command,
                "recognized": False,
                "error": f"No se pudo interpretar el comando: {str(e)}"
            }
    
    return {
        "command": command,
        "recognized": False,
        "error": "Comando no reconocido"
    }