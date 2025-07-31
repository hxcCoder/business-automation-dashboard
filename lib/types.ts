export interface Workflow {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "error"
  lastExecution: Date
  totalExecutions: number
  successRate: number
  avgExecutionTime: number
  timeSavedHours: number
  category: string
  triggers: string[]
  actions: string[]
}

export interface Execution {
  id: string
  workflowId: string
  workflowName: string
  status: "success" | "error" | "running"
  startTime: Date
  endTime?: Date
  duration?: number
  errorMessage?: string
  dataProcessed: number
  triggeredBy: string
}

export interface DashboardStats {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  successRate: number
  totalTimeSaved: number
  totalROI: number
  executionsToday: number
  errorsToday: number
}

export interface ChartData {
  date: string
  executions: number
  successes: number
  errors: number
  timeSaved: number
}

export interface WorkflowCategory {
  name: string
  count: number
  color: string
}