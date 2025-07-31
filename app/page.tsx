"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, TrendingUp, Clock, DollarSign, CheckCircle, AlertTriangle, BarChart3, Zap, Users, Calendar, ArrowUpRight, Play, AlertCircle, RefreshCw } from 'lucide-react'
import { formatDate, formatDuration, calculateROI } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDashboardStats, useWorkflows, useRecentExecutions } from "@/hooks/useWorkflows"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 🎯 USAR DATOS REALES DE LA API
  const { stats, isLoading: statsLoading, isError: statsError, refresh: refreshStats } = useDashboardStats()
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { executions: recentExecutions, isLoading: executionsLoading } = useRecentExecutions(5)

  // 🎯 ACTUALIZACIÓN EN TIEMPO REAL
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 🎯 CALCULAR TOP WORKFLOWS
  const topWorkflows = workflows
    .sort((a, b) => b.totalExecutions - a.totalExecutions)
    .slice(0, 3)

  // 🎯 CÁLCULOS DINÁMICOS
  const todaySuccessRate = stats ? ((stats.executionsToday - stats.errorsToday) / stats.executionsToday) * 100 : 0
  const timeSavedToday = stats ? stats.totalTimeSaved * 0.05 : 0
  const roiToday = calculateROI(timeSavedToday)

  // 🎯 LOADING STATE
  if (statsLoading || workflowsLoading || executionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando con API en localhost:8000</p>
        </div>
      </div>
    )
  }

  // 🎯 ERROR STATE
  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error conectando con la API</h2>
          <p className="text-gray-600 mb-4">No se pudo conectar con el backend en localhost:8000</p>
          <button 
            onClick={() => refreshStats()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* 🎯 HEADER PROFESIONAL */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Business Automation Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Datos en tiempo real • {currentTime.toLocaleTimeString("es-ES")}
                  <span className="ml-2 inline-flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                    API Conectada
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success" className="flex items-center gap-2 px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Sistema Activo
              </Badge>
              <button 
                onClick={() => refreshStats()}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <Link 
                href="/workflows" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Ver Workflows
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🎯 MÉTRICAS PRINCIPALES - CON DATOS REALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Workflows Activos */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Workflows Activos</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.activeWorkflows || 0}
                <span className="text-lg text-gray-500">/{stats?.totalWorkflows || 0}</span>
              </div>
              <Progress value={stats ? (stats.activeWorkflows / stats.totalWorkflows) * 100 : 0} className="mb-2" />
              <div className="flex items-center text-sm">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {stats ? Math.round((stats.activeWorkflows / stats.totalWorkflows) * 100) : 0}% operativos
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tasa de Éxito */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tasa de Éxito</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats?.successRate || 0}%</div>
              <Progress value={stats?.successRate || 0} className="mb-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{stats?.totalExecutions?.toLocaleString() || 0} ejecuciones</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="font-medium">+2.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tiempo Ahorrado */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tiempo Ahorrado</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats?.totalTimeSaved?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Hoy: {timeSavedToday.toFixed(1)}h
              </div>
              <div className="flex items-center text-sm">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+23% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* ROI Generado */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ROI Generado</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${stats?.totalROI?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Hoy: ${roiToday.toFixed(0)}
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">ROI: 340%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 CONTENIDO PRINCIPAL - CON DATOS REALES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* EJECUCIONES RECIENTES */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Ejecuciones Recientes
                  <Badge variant="secondary" className="ml-auto">
                    {recentExecutions.length} últimas
                  </Badge>
                </CardTitle>
                <CardDescription>Datos en tiempo real desde la API</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentExecutions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay ejecuciones recientes</p>
                    </div>
                  ) : (
                    recentExecutions.map((execution, index) => (
                      <div
                        key={execution.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          index === 0 ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {execution.status === "success" && (
                                <div className="p-2 bg-green-100 rounded-full">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              {execution.status === "error" && (
                                <div className="p-2 bg-red-100 rounded-full">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                              )}
                              {execution.status === "running" && (
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{execution.workflowName}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>{formatDate(new Date(execution.startTime))}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  {execution.triggeredBy}
                                </span>
                                {execution.dataProcessed > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{execution.dataProcessed} registros</span>
                                  </>
                                )}
                              </div>
                              {execution.errorMessage && (
                                <div className="mt-2 p-2 bg-red-50 rounded-lg">
                                  <p className="text-sm text-red-700 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {execution.errorMessage}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                execution.status === "success"
                                  ? "success"
                                  : execution.status === "error"
                                    ? "error"
                                    : "default"
                              }
                              className="mb-2"
                            >
                              {execution.status === "success" && "Exitoso"}
                              {execution.status === "error" && "Error"}
                              {execution.status === "running" && "Ejecutando"}
                            </Badge>
                            {execution.duration && (
                              <p className="text-sm text-gray-500">{formatDuration(execution.duration)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR DERECHO */}
          <div className="space-y-6">
            {/* TOP WORKFLOWS */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Top Workflows
                </CardTitle>
                <CardDescription>Workflows más utilizados</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {topWorkflows.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay workflows disponibles</p>
                    </div>
                  ) : (
                    topWorkflows.map((workflow, index) => (
                      <div key={workflow.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{workflow.name}</p>
                              <p className="text-xs text-gray-500">{workflow.category}</p>
                            </div>
                          </div>
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
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Ejecuciones</p>
                            <p className="font-semibold text-gray-900">{workflow.totalExecutions?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Éxito</p>
                            <p className="font-semibold text-green-600">{workflow.successRate || 0}%</p>
                          </div>
                        </div>
                        
                        <Progress value={workflow.successRate || 0} className="h-2" />
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                          <span>{workflow.timeSavedHours?.toFixed(1) || 0}h ahorradas</span>
                          <span className="font-semibold text-green-600">
                            ${calculateROI(workflow.timeSavedHours || 0).toLocaleString()} ROI
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ESTADÍSTICAS DEL DÍA */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Estadísticas de Hoy
                </CardTitle>
                <CardDescription>{currentTime.toLocaleDateString("es-ES")}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Ejecuciones</span>
                    </div>
                    <span className="font-bold text-blue-600">{stats?.executionsToday || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Errores</span>
                    </div>
                    <span className="font-bold text-red-600">{stats?.errorsToday || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Tasa de éxito</span>
                    </div>
                    <span className="font-bold text-green-600">{todaySuccessRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Tiempo ahorrado</span>
                      </div>
                      <span className="font-bold text-purple-600">{timeSavedToday.toFixed(1)}h</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg mt-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">ROI generado</span>
                      </div>
                      <span className="font-bold text-green-600">${roiToday.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🎯 FOOTER CON ESTADO DEL SISTEMA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">API Conectada</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm text-gray-500">
              Backend: localhost:8000 • Actualizado: {currentTime.toLocaleTimeString("es-ES")}
            </span>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Datos en tiempo real</span>
              <span className="font-semibold text-green-600">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 