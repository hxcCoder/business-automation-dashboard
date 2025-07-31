from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class WorkflowStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"

class ExecutionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    RUNNING = "running"
    WAITING = "waiting"

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "General"
    status: WorkflowStatus = WorkflowStatus.INACTIVE

class Workflow(WorkflowBase):
    id: str
    n8n_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_execution: Optional[datetime] = None
    total_executions: int = 0
    success_rate: float = 0.0
    avg_execution_time: float = 0.0
    time_saved_hours: float = 0.0
    triggers: List[str] = []
    actions: List[str] = []
    
    class Config:
        from_attributes = True

class ExecutionBase(BaseModel):
    workflow_id: str
    status: ExecutionStatus
    triggered_by: str = "manual"
    data_processed: int = 0

class Execution(ExecutionBase):
    id: str
    workflow_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    error_message: Optional[str] = None
    n8n_execution_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_workflows: int
    active_workflows: int
    total_executions: int
    success_rate: float
    total_time_saved: float
    total_roi: float
    executions_today: int
    errors_today: int

class ChartData(BaseModel):
    date: str
    executions: int
    successes: int
    errors: int
    time_saved: float

class N8NWorkflow(BaseModel):
    id: str
    name: str
    active: bool
    createdAt: str
    updatedAt: str
    nodes: List[Dict[str, Any]]
    connections: Dict[str, Any]
    settings: Dict[str, Any]