"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Heart,
  Gamepad2,
  MoreHorizontal,
  Trash2,
  RefreshCw,
} from "lucide-react"
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getCouples,
  type Transaction,
  type Couple,
} from "@/lib/supabase"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { SavingsGoals } from "@/components/savings-goals"

const categories = {
  income: [
    { id: "salary", name: "💼 Salario", icon: Wallet },
    { id: "freelance", name: "💻 Freelance", icon: TrendingUp },
    { id: "other-income", name: "💰 Otros ingresos", icon: PlusCircle },
  ],
  expense: [
    { id: "housing", name: "🏠 Vivienda", icon: Home },
    { id: "transport", name: "🚗 Transporte", icon: Car },
    { id: "food", name: "🍕 Alimentación", icon: ShoppingCart },
    { id: "entertainment", name: "🎬 Entretenimiento", icon: Coffee },
    { id: "health", name: "💊 Salud", icon: Heart },
    { id: "hobbies", name: "🎮 Hobbies", icon: Gamepad2 },
    { id: "other", name: "📦 Otros", icon: MoreHorizontal },
  ],
}

export default function DuoProfitsApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense" as "income" | "expense",
    person: "person1" as "person1" | "person2",
  })
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Obtener la primera pareja disponible (en una app real, esto sería por autenticación)
      const couples = await getCouples()
      if (couples.length > 0) {
        const selectedCouple = couples[0]
        setCouple(selectedCouple)

        // Cargar transacciones de la pareja
        const coupleTransactions = await getTransactions(selectedCouple.id)
        setTransactions(coupleTransactions)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const envUsername = process.env.NEXT_PUBLIC_STATIC_USERNAME
    const envPassword = process.env.NEXT_PUBLIC_STATIC_PASSWORD

    if (username === envUsername && password === envPassword) {
      setIsAuthenticated(true)
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTotalIncome = () => {
    return transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = () => {
    return transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  }

  const getPersonBalance = (person: "person1" | "person2") => {
    const income = transactions
      .filter((t) => t.type === "income" && t.person === person)
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "expense" && t.person === person)
      .reduce((sum, t) => sum + t.amount, 0)
    return income - expenses
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category || !couple) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const transaction = {
        couple_id: couple.id,
        amount: Number.parseInt(newTransaction.amount),
        description: newTransaction.description,
        category: newTransaction.category,
        type: newTransaction.type,
        person: newTransaction.person,
        transaction_date: new Date().toISOString().split("T")[0],
      }

      const addedTransaction = await addTransaction(transaction)
      setTransactions([addedTransaction, ...transactions])

      setNewTransaction({
        amount: "",
        description: "",
        category: "",
        type: "expense",
        person: "person1",
      })
      setIsAddingTransaction(false)

      toast({
        title: "¡Éxito!",
        description: "Transacción agregada correctamente.",
      })
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la transacción.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter((t) => t.id !== id))
      toast({
        title: "Eliminado",
        description: "Transacción eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la transacción.",
        variant: "destructive",
      })
    }
  }

  const getCategoryIcon = (categoryId: string, type: "income" | "expense") => {
    const categoryList = categories[type]
    const category = categoryList.find((c) => c.id === categoryId)
    return category ? category.icon : MoreHorizontal
  }

  const getCategoryName = (categoryId: string, type: "income" | "expense") => {
    const categoryList = categories[type]
    const category = categoryList.find((c) => c.id === categoryId)
    return category ? category.name : "Otros"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-700 font-roboto-medium text-lg">Cargando datos...</p>
          <p className="text-gray-500 font-roboto-regular text-sm mt-2">⏳ Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full card-modern border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-roboto-bold text-gray-800 mb-2">❌ No hay datos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 font-roboto-regular mb-6">
              🗄️ No se encontraron parejas en la base de datos. Ejecuta el script SQL para crear datos de ejemplo.
            </p>
            <Button onClick={loadInitialData} className="btn-modern">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md mx-auto p-6">
          <Card className="card-modern border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
            
              <CardTitle className="text-2xl font-roboto-bold text-gray-800 mb-2">💰 DuoProfits</CardTitle>
              <p className="text-gray-600 font-roboto-regular"> Inicia sesión para acceder a tu cuenta</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm font-roboto-regular">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-roboto-medium">
                    👤 Usuario
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 font-roboto-regular focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-roboto-medium">
                    🔒 Contraseña
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 font-roboto-regular focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-modern py-3 text-white font-roboto-medium"
                >
                  🚀 Iniciar Sesión
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-md mx-auto">
        {/* Header con gradiente azul */}
        <div className="header-gradient text-center py-8 px-4 text-white">
          <h1 className="text-3xl font-roboto-bold text-shadow mb-2">💰 Nuestras Finanzas</h1>
          <p className="text-blue-100 font-roboto-light text-shadow">👫 Familia Gómez De La Cruz</p>
          <Button variant="ghost" size="sm" onClick={loadInitialData} className="mt-2 text-blue-200 hover:text-blue-100 hover:bg-blue-600/20">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-red-200 hover:text-red-100 hover:bg-red-600/20"
            onClick={() => {
              setIsAuthenticated(false)
              setActiveTab("dashboard")
            }}
          >
            🚪 Cerrar Sesión
          </Button>
        </div>

        {/* Navegación por pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 -mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-sm">
              <span className="hidden sm:inline">💰 Dashboard</span>
              <span className="sm:hidden">💰</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center justify-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-sm">
              <span className="hidden sm:inline">📊 Estadísticas</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center justify-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-sm">
              <span className="hidden sm:inline">🎯 Metas</span>
              <span className="sm:hidden">🎯</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Principal */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Balance General - Solo Ingresos y Gastos */}
            <Card className="bg-blue-gradient text-white shadow-xl border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-roboto-medium text-white">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Wallet className="h-5 w-5" />
                  </div>
                  Balance General
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mini gráfico de línea simulado */}
                <div className="mb-6 h-20 relative overflow-hidden">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="2"
                      points="0,60 50,45 100,50 150,30 200,35 250,20 300,25"
                    />
                    <polyline
                      fill="url(#chartGradient)"
                      stroke="none"
                      points="0,60 50,45 100,50 150,30 200,35 250,20 300,25 300,80 0,80"
                    />
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="text-center">
                    <div className="bg-white/20 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="text-blue-100 text-xs mb-1">💰 Ingresos</div>
                    <div className="font-semibold text-lg">{formatCurrency(getTotalIncome())}</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div className="text-blue-100 text-xs mb-1">💸 Gastos</div>
                    <div className="font-semibold text-lg">{formatCurrency(getTotalExpenses())}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance por Persona - Diseño moderno inspirado en la imagen */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-modern border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm font-roboto-medium">
                          {couple.person1_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-roboto-regular">{couple.person1_name}</p>
                      <p className="text-xs text-gray-500">👤 Balance Personal</p>
                    </div>
                  </div>
                  <div className="text-xl font-roboto-bold text-gray-800">{formatCurrency(getPersonBalance("person1"))}</div>
                </CardContent>
              </Card>

              <Card className="card-modern border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-600 text-white text-sm font-roboto-medium">
                          {couple.person2_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-roboto-regular">{couple.person2_name}</p>
                      <p className="text-xs text-gray-500">👤 Balance Personal</p>
                    </div>
                  </div>
                  <div className="text-xl font-roboto-bold text-gray-800">{formatCurrency(getPersonBalance("person2"))}</div>
                </CardContent>
              </Card>
            </div>

            {/* Botón Agregar Transacción */}
            <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-roboto-medium">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  ➕ Agregar Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto card-modern border-0 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-800 font-roboto-bold text-xl">💸 Nueva Transacción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, type: value as "income" | "expense", category: "" })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                      <TabsTrigger value="income" className="data-[state=active]:bg-green-500 data-[state=active]:text-white font-roboto-medium">💰 Ingreso</TabsTrigger>
                      <TabsTrigger value="expense" className="data-[state=active]:bg-red-500 data-[state=active]:text-white font-roboto-medium">💸 Gasto</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="person">👤 Persona</Label>
                    <Select
                      value={newTransaction.person}
                      onValueChange={(value) =>
                        setNewTransaction({ ...newTransaction, person: value as "person1" | "person2" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person1">{couple.person1_name}</SelectItem>
                        <SelectItem value="person2">{couple.person2_name}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">💰 Monto (COP)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">📝 Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Descripción de la transacción"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">📂 Categoría</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="📂 Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[newTransaction.type].map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddTransaction} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-roboto-medium py-3 rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ⏳ Agregando...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        ✅ Agregar Transacción
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Lista de Transacciones Recientes - Diseño moderno */}
            <Card className="card-modern border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-800 font-roboto-bold flex items-center gap-2">
                  <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  📊 Transacciones Recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-roboto-medium text-gray-600">💸 No hay transacciones aún</p>
                    <p className="text-sm text-gray-500 font-roboto-regular">➕ Agrega tu primera transacción</p>
                  </div>
                ) : (
                  transactions.slice(0, 10).map((transaction) => {
                    const IconComponent = getCategoryIcon(transaction.category, transaction.type)
                    return (
                      <div
                        key={transaction.id}
                        className="transaction-item-modern flex items-center justify-between p-4 rounded-xl group transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              transaction.type === "income" 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            }`}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roboto-medium text-gray-800 mb-1">{transaction.description}</div>
                            <div className="text-sm text-gray-500 font-roboto-regular">
                              {getCategoryName(transaction.category, transaction.type)} •
                              {transaction.person === "person1" ? ` ${couple.person1_name}` : ` ${couple.person2_name}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`font-roboto-bold text-lg ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estadísticas */}
          <TabsContent value="statistics">
            <StatisticsDashboard coupleId={couple.id} couple={couple} />
          </TabsContent>

          {/* Metas de Ahorro */}
          <TabsContent value="goals">
            <SavingsGoals coupleId={couple.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
