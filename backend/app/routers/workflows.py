from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..models import Workflow, DashboardStats
from ..database import Database
from ..n8n_client import N8NClient

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

def get_database():
    return Database()

def get_n8n_client():
    return N8NClient()

@router.get("/", response_model=List[Workflow])
async def get_workflows(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Database = Depends(get_database)
):
    """Obtener todos los workflows con filtros opcionales"""
    workflows = db.get_workflows()
    
    # Aplicar filtros
    if category and category != "all":
        workflows = [w for w in workflows if w.category.lower() == category.lower()]
    
    if status and status != "all":
        workflows = [w for w in workflows if w.status == status]
    
    return workflows

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Database = Depends(get_database)):
    """Obtener estadísticas del dashboard"""
    return db.get_dashboard_stats()

@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    n8n_client: N8NClient = Depends(get_n8n_client),
    db: Database = Depends(get_database)
):
    """Ejecutar un workflow específico"""
    try:
        # Ejecutar en N8N
        result = n8n_client.execute_workflow(workflow_id)
        
        # Registrar la ejecución en la base de datos
        # (Aquí podrías agregar lógica para guardar la ejecución)
        
        return {
            "success": True,
            "message": f"Workflow {workflow_id} ejecutado correctamente",
            "execution_id": result.get("data", {}).get("id"),
            "n8n_result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ejecutando workflow: {str(e)}")

@router.patch("/{workflow_id}/activate")
async def activate_workflow(
    workflow_id: str,
    n8n_client: N8NClient = Depends(get_n8n_client)
):
    """Activar un workflow"""
    try:
        result = n8n_client.activate_workflow(workflow_id)
        return {
            "success": True,
            "message": f"Workflow {workflow_id} activado",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error activando workflow: {str(e)}")

@router.patch("/{workflow_id}/deactivate")
async def deactivate_workflow(
    workflow_id: str,
    n8n_client: N8NClient = Depends(get_n8n_client)
):
    """Desactivar un workflow"""
    try:
        result = n8n_client.deactivate_workflow(workflow_id)
        return {
            "success": True,
            "message": f"Workflow {workflow_id} desactivado",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error desactivando workflow: {str(e)}")

@router.get("/sync")
async def sync_with_n8n(
    n8n_client: N8NClient = Depends(get_n8n_client),
    db: Database = Depends(get_database)
):
    """Sincronizar workflows con N8N"""
    try:
        n8n_workflows = n8n_client.get_workflows()
        
        # Aquí podrías agregar lógica para sincronizar con la base de datos
        # Por ejemplo, actualizar estados, crear nuevos workflows, etc.
        
        return {
            "success": True,
            "message": f"Sincronizados {len(n8n_workflows)} workflows",
            "workflows": [w.dict() for w in n8n_workflows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sincronizando: {str(e)}")