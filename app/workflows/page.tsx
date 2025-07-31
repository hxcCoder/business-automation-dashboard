"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Search, Filter, MoreVertical, Play, Pause, Settings, BarChart3, Clock, CheckCircle, AlertTriangle, Activity, Zap, Calendar, TrendingUp, Users, Database, Mail, Globe, ShoppingCart, HeadphonesIcon, DollarSign, Eye, Edit, Trash2 } from 'lucide-react'
import { mockWorkflows, mockExecutions } from "@/lib/mock-data"
import { formatDate, formatDuration, calculateROI } from "@/lib/utils"
import Link from "next/link"
import { useState, useMemo } from "react"
import type { Workflow } from "@/lib/types"

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "error">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "executions" | "success" | "lastExecution">("executions")

  // 🎯 FILTRADO Y ORDENAMIENTO AVANZADO
  const filteredWorkflows = useMemo(() => {
    let filtered = mockWorkflows.filter((workflow) => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || workflow.status === statusFilter
      const matchesCategory = categoryFilter === "all" || workflow.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "executions":
          return b.totalExecutions - a.totalExecutions
        case "success":
          return b.successRate - a.successRate
        case "lastExecution":
          return new Date(b.lastExecution).getTime() - new Date(a.lastExecution).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, statusFilter, categoryFilter, sortBy])

  // 🎯 ESTADÍSTICAS CALCULADAS
  const categories = Array.from(new Set(mockWorkflows.map(w => w.category)))
  const totalExecutions = filteredWorkflows.reduce((sum, w) => sum + w.totalExecutions, 0)
  const avgSuccessRate = filteredWorkflows.reduce((sum, w) => sum + w.successRate, 0) / filteredWorkflows.length || 0

  // 🎯 ICONOS POR CATEGORÍA
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "e-commerce": return ShoppingCart
      case "sales": return TrendingUp
      case "marketing": return Globe
      case "support": return HeadphonesIcon
      case "finance": return DollarSign
      default: return Activity
    }
  }

  // 🎯 OBTENER EJECUCIONES POR WORKFLOW
  const getWorkflowExecutions = (workflowId: string) => {
    return mockExecutions.filter(exec => exec.workflowId === workflowId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* 🎯 HEADER */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Workflows</h1>
                <p className="text-sm text-gray-500">{filteredWorkflows.length} workflows encontrados</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                {totalExecutions.toLocaleString()} ejecuciones totales
              </Badge>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Nuevo Workflow
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🎯 ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredWorkflows.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredWorkflows.filter(w => w.status === "active").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Éxito Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${filteredWorkflows.reduce((sum, w) => sum + calculateROI(w.timeSavedHours), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 CONTROLES DE FILTRADO */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="error">Con errores</option>
              </select>

              {/* Filtro por Categoría */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Ordenamiento */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="executions">Más ejecutados</option>
                <option value="name">Nombre A-Z</option>
                <option value="success">Mayor éxito</option>
                <option value="lastExecution">Más recientes</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 🎯 LISTA DE WORKFLOWS */}
        <div className="grid gap-6">
          {filteredWorkflows.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron workflows</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </Card>
          ) : (
            filteredWorkflows.map((workflow) => {
              const CategoryIcon = getCategoryIcon(workflow.category)
              const recentExecutions = getWorkflowExecutions(workflow.id)
              const lastExecution = recentExecutions[0]

              return (
                <Card key={workflow.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{workflow.name}</h3>
                            <Badge
                              variant={
                                workflow.status === "active"
                                  ? "success"
                                  : workflow.status === "error"
                                    ? "error"
                                    : "secondary"
                              }
                            >
                              {workflow.status === "active" && "Activo"}
                              {workflow.status === "error" && "Error"}
                              {workflow.status === "inactive" && "Inactivo"}
                            </Badge>
                            <Badge variant="outline">{workflow.category}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{workflow.description}</p>
                          
                          {/* Triggers y Actions */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Triggers:</span>
                              {workflow.triggers.map((trigger, index) => (
                                <Badge key={index} variant="outline" className="ml-1 text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Actions:</span>
                              {workflow.actions.map((action, index) => (
                                <Badge key={index} variant="secondary" className="ml-1 text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menú de acciones */}
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Métricas del Workflow */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Ejecuciones</p>
                        <p className="text-lg font-bold text-blue-600">{workflow.totalExecutions.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Éxito</p>
                        <p className="text-lg font-bold text-green-600">{workflow.successRate}%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tiempo Avg</p>
                        <p className="text-lg font-bold text-purple-600">{formatDuration(workflow.avgExecutionTime)}</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tiempo Ahorrado</p>
                        <p className="text-lg font-bold text-yellow-600">{workflow.timeSavedHours.toFixed(1)}h</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-green-600">${calculateROI(workflow.timeSavedHours).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress Bar y Última Ejecución */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Tasa de Éxito</span>
                          <span className="text-sm text-gray-500">{workflow.successRate}%</span>
                        </div>
                        <Progress value={workflow.successRate} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Última ejecución: {formatDate(workflow.lastExecution)}</span>
                        </div>
                        {lastExecution && (
                          <div className="flex items-center gap-2">
                            {lastExecution.status === "success" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">{lastExecution.status}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <div className="flex items-center space-x-2">
                        {workflow.status === "active" ? (
                          <button className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                            <Pause className="h-3 w-3" />
                            Pausar
                          </button>
                        ) : (
                          <button className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                            <Play className="h-3 w-3" />
                            Activar
                          </button>
                        )}
                        <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                          <Zap className="h-3 w-3" />
                          Ejecutar Ahora
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {workflow.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* 🎯 PAGINACIÓN (Simulada) */}
        {filteredWorkflows.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}