// hooks/useWorkflows.ts
import useSWR from 'swr'
import { workflowAPI, executionAPI } from '@/lib/api'
import type { Workflow, DashboardStats, Execution } from '@/lib/types'

export function useWorkflows(filters?: { category?: string; status?: string }) {
  const { data, error, mutate } = useSWR(
    ['workflows', filters],
    () => workflowAPI.getAll(filters),
    {
      refreshInterval: 10000, // Actualizar cada 10 segundos
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  return {
    workflows: (data || []) as Workflow[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}

export function useDashboardStats() {
  const { data, error, mutate } = useSWR(
    'dashboard-stats',
    workflowAPI.getStats,
    {
      refreshInterval: 5000, // Actualizar cada 5 segundos
      revalidateOnFocus: true
    }
  )

  return {
    stats: data as DashboardStats,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}

export function useExecutions(workflowId?: string, limit: number = 50) {
  const { data, error, mutate } = useSWR(
    ['executions', workflowId, limit],
    () => executionAPI.getAll(workflowId, limit),
    {
      refreshInterval: 3000, // Actualizar cada 3 segundos
      revalidateOnFocus: true
    }
  )

  return {
    executions: (data || []) as Execution[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}

export function useRecentExecutions(limit: number = 10) {
  const { data, error, mutate } = useSWR(
    ['recent-executions', limit],
    () => executionAPI.getRecent(limit),
    {
      refreshInterval: 2000, // Actualizar cada 2 segundos
      revalidateOnFocus: true
    }
  )

  return {
    executions: (data || []) as Execution[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}