from fastapi import APIRouter, Depends
from typing import List, Optional
from ..models import Execution
from ..database import Database

router = APIRouter(prefix="/api/executions", tags=["executions"])

def get_database():
    return Database()

@router.get("/", response_model=List[Execution])
async def get_executions(
    workflow_id: Optional[str] = None,
    limit: int = 50,
    db: Database = Depends(get_database)
):
    """Obtener ejecuciones con filtros opcionales"""
    return db.get_executions(workflow_id=workflow_id, limit=limit)

@router.get("/recent", response_model=List[Execution])
async def get_recent_executions(
    limit: int = 10,
    db: Database = Depends(get_database)
):
    """Obtener las ejecuciones más recientes"""
    return db.get_executions(limit=limit)