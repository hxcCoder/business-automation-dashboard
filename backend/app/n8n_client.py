import requests
from typing import List, Optional, Dict, Any
from .models import N8NWorkflow
import os
from dotenv import load_dotenv

load_dotenv()

class N8NClient:
    def __init__(self):
        self.base_url = os.getenv("N8N_BASE_URL", "http://localhost:5678/api/v1")
        self.api_key = os.getenv("N8N_API_KEY")
        self.headers = {
            "X-N8N-API-KEY": self.api_key,
            "Content-Type": "application/json"
        } if self.api_key else {"Content-Type": "application/json"}
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Hacer petición HTTP a N8N"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            response = requests.request(method, url, headers=self.headers, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to N8N: {e}")
            # Retornar datos mock si N8N no está disponible
            return self._get_mock_data(endpoint)
    
    def _get_mock_data(self, endpoint: str) -> Dict[str, Any]:
        """Datos mock cuando N8N no está disponible"""
        if "workflows" in endpoint:
            return {
                "data": [
                    {
                        "id": "1",
                        "name": "E-commerce Order Processing",
                        "active": True,
                        "createdAt": "2024-01-15T10:00:00.000Z",
                        "updatedAt": "2024-01-30T14:30:00.000Z",
                        "nodes": [
                            {"name": "Shopify Trigger", "type": "n8n-nodes-base.shopifyTrigger"},
                            {"name": "Process Order", "type": "n8n-nodes-base.function"}
                        ],
                        "connections": {},
                        "settings": {}
                    }
                ]
            }
        elif "executions" in endpoint:
            return {
                "data": [
                    {
                        "id": "exec-1",
                        "workflowId": "1",
                        "status": "success",
                        "startedAt": "2024-01-30T16:30:00.000Z",
                        "stoppedAt": "2024-01-30T16:30:02.000Z",
                        "mode": "webhook"
                    }
                ]
            }
        return {"data": []}
    
    def get_workflows(self) -> List[N8NWorkflow]:
        """Obtener todos los workflows de N8N"""
        response = self._make_request("GET", "/workflows")
        workflows = []
        
        for workflow_data in response.get("data", []):
            try:
                workflows.append(N8NWorkflow(**workflow_data))
            except Exception as e:
                print(f"Error parsing workflow {workflow_data.get('id')}: {e}")
                continue
        
        return workflows
    
    def get_workflow(self, workflow_id: str) -> Optional[N8NWorkflow]:
        """Obtener un workflow específico"""
        response = self._make_request("GET", f"/workflows/{workflow_id}")
        
        if response.get("data"):
            try:
                return N8NWorkflow(**response["data"])
            except Exception as e:
                print(f"Error parsing workflow {workflow_id}: {e}")
        
        return None
    
    def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Ejecutar un workflow"""
        return self._make_request("POST", f"/workflows/{workflow_id}/execute")
    
    def get_executions(self, workflow_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Obtener ejecuciones"""
        endpoint = "/executions"
        if workflow_id:
            endpoint += f"?workflowId={workflow_id}"
        
        response = self._make_request("GET", endpoint)
        return response.get("data", [])
    
    def activate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Activar un workflow"""
        return self._make_request("PATCH", f"/workflows/{workflow_id}", 
                                json={"active": True})
    
    def deactivate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Desactivar un workflow"""
        return self._make_request("PATCH", f"/workflows/{workflow_id}", 
                                json={"active": False})