"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Calendar, PieChart } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/supabase"

interface StatisticsDashboardProps {
  coupleId: string
}

interface CategoryStat {
  category: string
  amount: number
  count: number
}

interface MonthlyTrend {
  month: string
  total_income: number
  total_expenses: number
}

const categoryNames: Record<string, string> = {
  housing: "🏠 Vivienda",
  transport: "🚗 Transporte",
  food: "🍕 Alimentación",
  entertainment: "🎬 Entretenimiento",
  health: "💊 Salud",
  hobbies: "🎮 Hobbies",
  other: "📦 Otros",
  salary: "💼 Salario",
  freelance: "💻 Freelance",
  "other-income": "💰 Otros ingresos",
}

export function StatisticsDashboard({ coupleId }: StatisticsDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  })

  useEffect(() => {
    loadStatistics()
  }, [coupleId])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const allTransactions = await getTransactions(coupleId)
      setTransactions(allTransactions)
    } catch (error) {
      console.error("Error loading statistics:", error)
      setTransactions([])
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

  // Filtrar transacciones del mes actual
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date)
    const transactionMonth = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, "0")}`
    return transactionMonth === selectedMonth
  })

  // Calcular estadísticas por categoría
  const getCategoryStats = (): CategoryStat[] => {
    const expenseTransactions = currentMonthTransactions.filter(t => t.type === "expense")
    const categoryMap = new Map<string, { amount: number, count: number }>()

    expenseTransactions.forEach(transaction => {
      const category = transaction.category
      const current = categoryMap.get(category) || { amount: 0, count: 0 }
      categoryMap.set(category, {
        amount: current.amount + transaction.amount,
        count: current.count + 1
      })
    })

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount)
  }

  // Calcular tendencias mensuales de los últimos 6 meses
  const getMonthlyTrends = (): MonthlyTrend[] => {
    const trends: MonthlyTrend[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date)
        const transactionMonth = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, "0")}`
        return transactionMonth === monthKey
      })

      const totalIncome = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      trends.push({
        month: monthKey,
        total_income: totalIncome,
        total_expenses: totalExpenses
      })
    }

    return trends
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const categoryStats = getCategoryStats()
  const monthlyTrends = getMonthlyTrends()
  
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const currentBalance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Resumen General - Datos reales de Supabase */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            📊 Resumen de {formatMonth(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center mb-6">
            <div className="space-y-2">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 font-roboto-regular">💰 Ingresos</p>
              <p className="text-lg font-roboto-bold text-gray-800">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="space-y-2">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-600 font-roboto-regular">💸 Gastos</p>
              <p className="text-lg font-roboto-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${currentBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <BarChart3 className={`h-6 w-6 ${currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <p className="text-sm text-gray-600 font-roboto-regular">⚖️ Balance</p>
              <p className={`text-lg font-roboto-bold ${currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos por Categoría - Diseño moderno */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            📈 Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-roboto-medium text-gray-600">📊 No hay datos de gastos para este mes</p>
              <p className="text-sm text-gray-500 font-roboto-regular">➕ Agrega algunas transacciones para ver las estadísticas</p>
            </div>
          ) : (
            categoryStats.map((stat, index) => {
              const totalExpenses = categoryStats.reduce((sum, s) => sum + s.amount, 0)
              const percentage = totalExpenses > 0 ? (stat.amount / totalExpenses) * 100 : 0
              const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"]
              const bgColor = colors[index % colors.length]
              
              return (
                <div key={stat.category} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs font-roboto-bold">
                          {(categoryNames[stat.category] || stat.category).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-roboto-medium text-gray-800">{categoryNames[stat.category] || stat.category}</span>
                    </div>
                    <Badge 
                      variant="default"
                      className="font-roboto-medium"
                    >
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-roboto-regular">
                        {formatCurrency(stat.amount)}
                      </span>
                      <span className="text-gray-500 font-roboto-regular">
                        {stat.count} transaccione{stat.count !== 1 ? 's' : ''} 📝
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Tendencias Mensuales - Diseño moderno */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            📈 Tendencias de los Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-roboto-medium text-gray-600">📊 No hay datos suficientes para mostrar tendencias</p>
              <p className="text-sm text-gray-500 font-roboto-regular">📅 Agrega más transacciones durante varios meses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyTrends.map((trend, index) => (
                <div key={trend.month} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-roboto-medium text-gray-800">{formatMonth(trend.month)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-roboto-regular">⚖️ Balance:</span>
                      <span className={`font-roboto-bold ${trend.total_income - trend.total_expenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(trend.total_income - trend.total_expenses)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-600 font-roboto-regular">💰 Ingresos:</span>
                      <span className="font-roboto-medium text-green-600">{formatCurrency(trend.total_income)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 w-6 h-6 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="text-gray-600 font-roboto-regular">💸 Gastos:</span>
                      <span className="font-roboto-medium text-red-600">{formatCurrency(trend.total_expenses)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico Circular Simulado */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            🥧 Distribución de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            {/* Gráfico circular simulado con CSS */}
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #3b82f6 0deg 126deg,
                  #10b981 126deg 198deg,
                  #f97316 198deg 234deg,
                  #8b5cf6 234deg 360deg
                )`
              }}>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-roboto-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
                    <div className="text-xs text-gray-500">💸 Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {categoryStats.map((stat, index) => {
              const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"]
              const percentage = totalExpenses > 0 ? (stat.amount / totalExpenses) * 100 : 0
              
              return (
                <div key={stat.category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                  <span className="text-sm font-roboto-regular text-gray-600">
                    {categoryNames[stat.category]} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
