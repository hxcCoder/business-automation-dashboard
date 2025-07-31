// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new APIError(`HTTP error! status: ${response.status}`, response.status)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error)
    
    // Si la API no está disponible, usar datos mock como fallback
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('API no disponible, usando datos mock como fallback')
      return getMockData(endpoint)
    }
    
    throw error
  }
}

// Fallback a datos mock si la API no está disponible
function getMockData(endpoint: string) {
  // Importar datos mock como fallback
  if (endpoint.includes('/api/workflows/stats')) {
    return {
      total_workflows: 5,
      active_workflows: 3,
      total_executions: 4896,
      success_rate: 97.8,
      total_time_saved: 626.4,
      total_roi: 15660,
      executions_today: 47,
      errors_today: 2
    }
  }
  
  if (endpoint.includes('/api/workflows')) {
    return [
      {
        id: "wf-001",
        name: "E-commerce Order Processing",
        description: "Automatiza el procesamiento de pedidos desde Shopify hasta el sistema de inventario",
        status: "active",
        last_execution: new Date().toISOString(),
        total_executions: 1247,
        success_rate: 98.5,
        avg_execution_time: 2340,
        time_saved_hours: 156.2,
        category: "E-commerce",
        triggers: ["Shopify Webhook", "Schedule"],
        actions: ["Update Inventory", "Send Email", "Create Invoice"]
      }
    ]
  }
  
  return []
}

export const workflowAPI = {
  // Obtener todos los workflows
  getAll: async (filters?: { category?: string; status?: string }) => {
    let endpoint = '/api/workflows/'
    const params = new URLSearchParams()
    
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category)
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return fetchAPI(endpoint)
  },

  // Obtener estadísticas del dashboard
  getStats: async () => {
    return fetchAPI('/api/workflows/stats')
  },

  // Ejecutar workflow
  execute: async (workflowId: string) => {
    return fetchAPI(`/api/workflows/${workflowId}/execute`, {
      method: 'POST'
    })
  },

  // Activar workflow
  activate: async (workflowId: string) => {
    return fetchAPI(`/api/workflows/${workflowId}/activate`, {
      method: 'PATCH'
    })
  },

  // Desactivar workflow
  deactivate: async (workflowId: string) => {
    return fetchAPI(`/api/workflows/${workflowId}/deactivate`, {
      method: 'PATCH'
    })
  },

  // Sincronizar con N8N
  sync: async () => {
    return fetchAPI('/api/workflows/sync')
  }
}

export const executionAPI = {
  // Obtener todas las ejecuciones
  getAll: async (workflowId?: string, limit: number = 50) => {
    let endpoint = '/api/executions/'
    const params = new URLSearchParams()
    
    if (workflowId) params.append('workflow_id', workflowId)
    if (limit) params.append('limit', limit.toString())
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return fetchAPI(endpoint)
  },

  // Obtener ejecuciones recientes
  getRecent: async (limit: number = 10) => {
    return fetchAPI(`/api/executions/recent?limit=${limit}`)
  }
}