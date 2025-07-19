"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, TrendingDown, Calendar, PieChart, ChevronDown, ChevronUp } from "lucide-react"
import { getTransactions, type Transaction, type Couple } from "@/lib/supabase"

interface StatisticsDashboardProps {
  coupleId: string
  couple?: Couple
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

export function StatisticsDashboard({ coupleId, couple }: StatisticsDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  })

  useEffect(() => {
    loadStatistics()
  }, [coupleId])

  useEffect(() => {
    // Expandir solo el mes actual por defecto
    if (transactions.length > 0) {
      const currentMonth = new Date()
      const currentMonthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, "0")}`
      setExpandedMonths(new Set([currentMonthKey]))
    }
  }, [transactions])

  const toggleMonthExpansion = (month: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(month)) {
        newSet.delete(month)
      } else {
        newSet.add(month)
      }
      return newSet
    })
  }

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
    
    // Generar del mes más reciente al más antiguo (i de 0 a 5)
    for (let i = 0; i <= 5; i++) {
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

  // Calcular gastos por persona
  const getPersonExpenses = () => {
    const person1Expenses = currentMonthTransactions
      .filter(t => t.type === "expense" && t.person === "person1")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const person2Expenses = currentMonthTransactions
      .filter(t => t.type === "expense" && t.person === "person2")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = person1Expenses + person2Expenses
    
    return {
      person1: {
        amount: person1Expenses,
        percentage: totalExpenses > 0 ? (person1Expenses / totalExpenses) * 100 : 0,
        transactionCount: currentMonthTransactions.filter(t => t.type === "expense" && t.person === "person1").length
      },
      person2: {
        amount: person2Expenses,
        percentage: totalExpenses > 0 ? (person2Expenses / totalExpenses) * 100 : 0,
        transactionCount: currentMonthTransactions.filter(t => t.type === "expense" && t.person === "person2").length
      },
      total: totalExpenses
    }
  }

  // Calcular ingresos por persona
  const getPersonIncome = () => {
    const person1Income = currentMonthTransactions
      .filter(t => t.type === "income" && t.person === "person1")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const person2Income = currentMonthTransactions
      .filter(t => t.type === "income" && t.person === "person2")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalIncome = person1Income + person2Income
    
    return {
      person1: {
        amount: person1Income,
        percentage: totalIncome > 0 ? (person1Income / totalIncome) * 100 : 0,
        transactionCount: currentMonthTransactions.filter(t => t.type === "income" && t.person === "person1").length
      },
      person2: {
        amount: person2Income,
        percentage: totalIncome > 0 ? (person2Income / totalIncome) * 100 : 0,
        transactionCount: currentMonthTransactions.filter(t => t.type === "income" && t.person === "person2").length
      },
      total: totalIncome
    }
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
          <p className="text-sm text-gray-500 font-roboto-regular mt-2">
            👆 Haz clic en cualquier mes para ver detalles completos
          </p>
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
            <div className="space-y-3">
              {monthlyTrends.map((trend, index) => {
                const isExpanded = expandedMonths.has(trend.month)
                const currentMonth = new Date()
                const currentMonthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, "0")}`
                const isCurrentMonth = trend.month === currentMonthKey
                
                return (
                  <div key={trend.month} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleMonthExpansion(trend.month)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isCurrentMonth ? 'bg-blue-500' : 'bg-gray-400'}`} />
                        <span className="font-roboto-medium text-gray-800">{formatMonth(trend.month)}</span>
                        {isCurrentMonth && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            📅 Mes Actual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 font-roboto-regular">⚖️ Balance:</span>
                          <span className={`font-roboto-bold ${trend.total_income - trend.total_expenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(trend.total_income - trend.total_expenses)}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                        <div className="grid grid-cols-2 gap-6 text-sm pt-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-gray-700 font-roboto-medium">💰 Total Ingresos</span>
                            </div>
                            <div className="pl-8">
                              <span className="font-roboto-bold text-green-600 text-lg">
                                {formatCurrency(trend.total_income)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-red-100 w-6 h-6 rounded-full flex items-center justify-center">
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              </div>
                              <span className="text-gray-700 font-roboto-medium">💸 Total Gastos</span>
                            </div>
                            <div className="pl-8">
                              <span className="font-roboto-bold text-red-600 text-lg">
                                {formatCurrency(trend.total_expenses)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progreso del balance */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 font-roboto-regular">📊 Relación Ingresos vs Gastos</span>
                            <span className="text-sm font-roboto-medium text-gray-700">
                              {trend.total_income > 0 ? Math.round((trend.total_expenses / trend.total_income) * 100) : 0}% gastado
                            </span>
                          </div>
                          <Progress 
                            value={trend.total_income > 0 ? Math.min((trend.total_expenses / trend.total_income) * 100, 100) : 0}
                            className="h-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico Circular Simulado */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            🥧 Distribución de Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-roboto-medium text-gray-600">🥧 No hay gastos para mostrar</p>
              <p className="text-sm text-gray-500 font-roboto-regular">💸 Agrega algunas transacciones de gastos</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-8">
                {/* Gráfico circular dinámico basado en datos reales */}
                <div className="relative w-44 h-44">
                  {(() => {
                    const colors = [
                      "#3b82f6", // Azul
                      "#10b981", // Verde
                      "#f97316", // Naranja
                      "#8b5cf6", // Púrpura
                      "#ef4444", // Rojo
                      "#f59e0b", // Amarillo
                      "#84cc16", // Lima
                      "#06b6d4"  // Cyan
                    ]
                    
                    let currentAngle = 0
                    const gradientSegments = categoryStats.map((stat, index) => {
                      const percentage = (stat.amount / totalExpenses) * 100
                      const segmentAngle = (percentage / 100) * 360
                      const startAngle = currentAngle
                      const endAngle = currentAngle + segmentAngle
                      currentAngle = endAngle
                      
                      return `${colors[index % colors.length]} ${startAngle}deg ${endAngle}deg`
                    }).join(', ')
                    
                    return (
                      <div 
                        className="absolute inset-0 rounded-full" 
                        style={{
                          background: `conic-gradient(${gradientSegments})`
                        }}
                      >
                        <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center shadow-inner">
                          <div className="text-center">
                            <div className="text-lg font-roboto-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
                            <div className="text-xs text-gray-500 font-roboto-regular">💸 Total Gastos</div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
              
              {/* Leyenda dinámica con datos reales */}
              <div className="space-y-3 mt-6">
                {categoryStats.map((stat, index) => {
                  const colors = [
                    "bg-blue-500", 
                    "bg-green-500", 
                    "bg-orange-500", 
                    "bg-purple-500",
                    "bg-red-500",
                    "bg-yellow-500",
                    "bg-lime-500",
                    "bg-cyan-500"
                  ]
                  const percentage = totalExpenses > 0 ? (stat.amount / totalExpenses) * 100 : 0
                  
                  return (
                    <div key={stat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} flex-shrink-0`}></div>
                        <span className="font-roboto-medium text-gray-700">
                          {categoryNames[stat.category] || `📂 ${stat.category}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-roboto-bold text-gray-800">
                          {formatCurrency(stat.amount)}
                        </div>
                        <div className="text-sm text-gray-500 font-roboto-regular">
                          {percentage.toFixed(1)}% • {stat.count} transacción{stat.count !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Estadísticas adicionales */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-roboto-bold text-blue-600 text-lg">
                      {categoryStats.length}
                    </div>
                    <div className="text-blue-700 font-roboto-regular">📂 Categorías con gastos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-roboto-bold text-blue-600 text-lg">
                      {categoryStats.reduce((sum, stat) => sum + stat.count, 0)}
                    </div>
                    <div className="text-blue-700 font-roboto-regular">💸 Total transacciones</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Distribución de Gastos por Persona */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            👥 Distribución de Gastos por Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const personExpenses = getPersonExpenses()
            
            if (personExpenses.total === 0) {
              return (
                <div className="text-center py-12 text-gray-400">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-roboto-medium text-gray-600">👥 No hay gastos para comparar</p>
                  <p className="text-sm text-gray-500 font-roboto-regular">💸 Agrega algunas transacciones de gastos</p>
                </div>
              )
            }
            
            const person1Name = couple?.person1_name || "Persona 1"
            const person2Name = couple?.person2_name || "Persona 2"
            
            return (
              <>
                {/* Comparación visual */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Persona 1 */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-roboto-bold text-sm">
                            {person1Name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-roboto-medium text-blue-800">{person1Name}</p>
                          <p className="text-xs text-blue-600">👤 Gastos del mes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-roboto-bold text-blue-600">
                          {formatCurrency(personExpenses.person1.amount)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700 font-roboto-regular">📊 Porcentaje del total</span>
                            <span className="font-roboto-medium text-blue-800">
                              {personExpenses.person1.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={personExpenses.person1.percentage} 
                            className="h-2 bg-blue-200"
                          />
                        </div>
                        
                        <div className="text-sm text-blue-600 font-roboto-regular">
                          💳 {personExpenses.person1.transactionCount} transacción{personExpenses.person1.transactionCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Persona 2 */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-roboto-bold text-sm">
                            {person2Name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-roboto-medium text-purple-800">{person2Name}</p>
                          <p className="text-xs text-purple-600">👤 Gastos del mes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-roboto-bold text-purple-600">
                          {formatCurrency(personExpenses.person2.amount)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-700 font-roboto-regular">📊 Porcentaje del total</span>
                            <span className="font-roboto-medium text-purple-800">
                              {personExpenses.person2.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={personExpenses.person2.percentage} 
                            className="h-2 bg-purple-200"
                          />
                        </div>
                        
                        <div className="text-sm text-purple-600 font-roboto-regular">
                          💳 {personExpenses.person2.transactionCount} transacción{personExpenses.person2.transactionCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Resumen comparativo */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-roboto-bold text-gray-800 mb-3 flex items-center gap-2">
                    📊 Resumen Comparativo
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">💰 Total gastos del mes:</span>
                      <span className="font-roboto-bold text-gray-800">
                        {formatCurrency(personExpenses.total)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">
                        ⚖️ Diferencia:
                      </span>
                      <span className={`font-roboto-bold ${
                        personExpenses.person1.amount > personExpenses.person2.amount 
                          ? 'text-blue-600' 
                          : personExpenses.person2.amount > personExpenses.person1.amount
                          ? 'text-purple-600'
                          : 'text-gray-600'
                      }`}>
                        {formatCurrency(Math.abs(personExpenses.person1.amount - personExpenses.person2.amount))}
                        {personExpenses.person1.amount !== personExpenses.person2.amount && (
                          <span className="text-xs ml-1">
                            ({personExpenses.person1.amount > personExpenses.person2.amount 
                              ? `${person1Name} gastó más` 
                              : `${person2Name} gastó más`})
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">📈 Promedio por transacción:</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {person1Name}: {personExpenses.person1.transactionCount > 0 
                            ? formatCurrency(personExpenses.person1.amount / personExpenses.person1.transactionCount)
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {person2Name}: {personExpenses.person2.transactionCount > 0 
                            ? formatCurrency(personExpenses.person2.amount / personExpenses.person2.transactionCount)
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Distribución de Ingresos por Persona */}
      <Card className="card-modern border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800 font-roboto-bold">
            👥 Distribución de Ingresos por Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const personIncome = getPersonIncome()
            
            if (personIncome.total === 0) {
              return (
                <div className="text-center py-12 text-gray-400">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-roboto-medium text-gray-600">👥 No hay ingresos para comparar</p>
                  <p className="text-sm text-gray-500 font-roboto-regular">💰 Agrega algunas transacciones de ingresos</p>
                </div>
              )
            }
            
            const person1Name = couple?.person1_name || "Persona 1"
            const person2Name = couple?.person2_name || "Persona 2"
            
            return (
              <>
                {/* Comparación visual */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Persona 1 */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-roboto-bold text-sm">
                            {person1Name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-roboto-medium text-green-800">{person1Name}</p>
                          <p className="text-xs text-green-600">👤 Ingresos del mes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-roboto-bold text-green-600">
                          {formatCurrency(personIncome.person1.amount)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700 font-roboto-regular">📊 Porcentaje del total</span>
                            <span className="font-roboto-medium text-green-800">
                              {personIncome.person1.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={personIncome.person1.percentage} 
                            className="h-2 bg-green-200"
                          />
                        </div>
                        
                        <div className="text-sm text-green-600 font-roboto-regular">
                          💳 {personIncome.person1.transactionCount} transacción{personIncome.person1.transactionCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Persona 2 */}
                  <Card className="bg-teal-50 border-teal-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-500 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-white font-roboto-bold text-sm">
                            {person2Name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-roboto-medium text-teal-800">{person2Name}</p>
                          <p className="text-xs text-teal-600">👤 Ingresos del mes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-roboto-bold text-teal-600">
                          {formatCurrency(personIncome.person2.amount)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-teal-700 font-roboto-regular">📊 Porcentaje del total</span>
                            <span className="font-roboto-medium text-teal-800">
                              {personIncome.person2.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={personIncome.person2.percentage} 
                            className="h-2 bg-teal-200"
                          />
                        </div>
                        
                        <div className="text-sm text-teal-600 font-roboto-regular">
                          💳 {personIncome.person2.transactionCount} transacción{personIncome.person2.transactionCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Resumen comparativo */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-roboto-bold text-gray-800 mb-3 flex items-center gap-2">
                    📊 Resumen Comparativo de Ingresos
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">💰 Total ingresos del mes:</span>
                      <span className="font-roboto-bold text-gray-800">
                        {formatCurrency(personIncome.total)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">
                        ⚖️ Diferencia:
                      </span>
                      <span className={`font-roboto-bold ${
                        personIncome.person1.amount > personIncome.person2.amount 
                          ? 'text-green-600' 
                          : personIncome.person2.amount > personIncome.person1.amount
                          ? 'text-teal-600'
                          : 'text-gray-600'
                      }`}>
                        {formatCurrency(Math.abs(personIncome.person1.amount - personIncome.person2.amount))}
                        {personIncome.person1.amount !== personIncome.person2.amount && (
                          <span className="text-xs ml-1">
                            ({personIncome.person1.amount > personIncome.person2.amount 
                              ? `${person1Name} ganó más` 
                              : `${person2Name} ganó más`})
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-roboto-regular">📈 Promedio por transacción:</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {person1Name}: {personIncome.person1.transactionCount > 0 
                            ? formatCurrency(personIncome.person1.amount / personIncome.person1.transactionCount)
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {person2Name}: {personIncome.person2.transactionCount > 0 
                            ? formatCurrency(personIncome.person2.amount / personIncome.person2.transactionCount)
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Relación ingresos vs gastos por persona */}
                    {(() => {
                      const personExpenses = getPersonExpenses()
                      
                      return (
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="mb-2">
                            <span className="text-gray-600 font-roboto-regular">💡 Balance individual (Ingresos - Gastos):</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-white p-2 rounded border-l-4 border-green-400">
                              <div className="font-roboto-medium text-gray-700">{person1Name}</div>
                              <div className={`font-roboto-bold ${
                                (personIncome.person1.amount - personExpenses.person1.amount) >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {formatCurrency(personIncome.person1.amount - personExpenses.person1.amount)}
                              </div>
                            </div>
                            
                            <div className="bg-white p-2 rounded border-l-4 border-teal-400">
                              <div className="font-roboto-medium text-gray-700">{person2Name}</div>
                              <div className={`font-roboto-bold ${
                                (personIncome.person2.amount - personExpenses.person2.amount) >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {formatCurrency(personIncome.person2.amount - personExpenses.person2.amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
