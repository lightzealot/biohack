"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Calendar, PieChart } from "lucide-react"
import { getCategoryStats, getMonthlyTrends, type CategoryStats } from "@/lib/supabase"

interface StatisticsDashboardProps {
  coupleId: string
}

const categoryNames: Record<string, string> = {
  housing: "Vivienda",
  transport: "Transporte",
  food: "Alimentación",
  entertainment: "Entretenimiento",
  health: "Salud",
  hobbies: "Hobbies",
  other: "Otros",
}

export function StatisticsDashboard({ coupleId }: StatisticsDashboardProps) {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  })

  useEffect(() => {
    loadStatistics()
  }, [coupleId, selectedMonth])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const [stats, trends] = await Promise.all([
        getCategoryStats(coupleId, selectedMonth),
        getMonthlyTrends(coupleId, 6),
      ])

      setCategoryStats(stats)
      setMonthlyTrends(trends)
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" })
  }

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return "bg-green-500"
    if (percentage <= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getBadgeVariant = (percentage: number) => {
    if (percentage <= 50) return "default"
    if (percentage <= 80) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  const totalBudget = categoryStats.reduce((sum, stat) => sum + stat.budget, 0)
  const totalSpent = categoryStats.reduce((sum, stat) => sum + stat.amount, 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumen de {formatMonth(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progreso general del presupuesto</span>
              <Badge variant={getBadgeVariant(overallPercentage)}>{overallPercentage.toFixed(1)}%</Badge>
            </div>
            <Progress value={Math.min(overallPercentage, 100)} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Gastado:</span>
                <div className="font-semibold text-red-600">{formatCurrency(totalSpent)}</div>
              </div>
              <div>
                <span className="text-gray-600">Presupuesto:</span>
                <div className="font-semibold text-blue-600">{formatCurrency(totalBudget)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de gastos para este mes</p>
            </div>
          ) : (
            categoryStats.map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{categoryNames[stat.category] || stat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(stat.amount)} / {formatCurrency(stat.budget)}
                    </span>
                    <Badge variant={getBadgeVariant(stat.percentage)} className="text-xs">
                      {stat.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={Math.min(stat.percentage, 100)} className="h-2" />
                  {stat.percentage > 100 && (
                    <div
                      className="absolute top-0 left-0 h-2 bg-red-600 rounded-full opacity-20"
                      style={{ width: "100%" }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Tendencias Mensuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias de los Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay suficientes datos para mostrar tendencias</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyTrends.map((trend) => (
                <div key={trend.month} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{formatMonth(trend.month)}</h4>
                    <div
                      className={`flex items-center gap-1 ${trend.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {trend.balance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-semibold">{formatCurrency(Math.abs(trend.balance))}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ingresos:</span>
                      <div className="font-semibold text-green-600">{formatCurrency(trend.income)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gastos:</span>
                      <div className="font-semibold text-red-600">{formatCurrency(trend.expenses)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
