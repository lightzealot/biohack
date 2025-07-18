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
  BarChart3,
  Target,
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
    { id: "salary", name: "Salario", icon: Wallet },
    { id: "freelance", name: "Freelance", icon: TrendingUp },
    { id: "other-income", name: "Otros ingresos", icon: PlusCircle },
  ],
  expense: [
    { id: "housing", name: "Vivienda", icon: Home },
    { id: "transport", name: "Transporte", icon: Car },
    { id: "food", name: "Alimentación", icon: ShoppingCart },
    { id: "entertainment", name: "Entretenimiento", icon: Coffee },
    { id: "health", name: "Salud", icon: Heart },
    { id: "hobbies", name: "Hobbies", icon: Gamepad2 },
    { id: "other", name: "Otros", icon: MoreHorizontal },
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

  const balance = getTotalIncome() - getTotalExpenses()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">No hay datos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              No se encontraron parejas en la base de datos. Ejecuta el script SQL para crear datos de ejemplo.
            </p>
            <Button onClick={loadInitialData}>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="p-6 bg-white rounded shadow-md w-96"
        >
          <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-6 px-4">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">DuoProfits</h1>
          <p className="text-purple-600">Presupuesto de {couple.name}</p>
          <Button variant="ghost" size="sm" onClick={loadInitialData} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-red-600 hover:text-red-800"
            onClick={() => {
              setIsAuthenticated(false)
              setActiveTab("dashboard")
            }}
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Navegación por pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Principal */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Balance General */}
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5" />
                  Balance Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Ingresos
                    </div>
                    <div className="font-semibold">{formatCurrency(getTotalIncome())}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown className="h-4 w-4" />
                      Gastos
                    </div>
                    <div className="font-semibold">{formatCurrency(getTotalExpenses())}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance por Persona */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                        {couple.person1_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {couple.person1_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(getPersonBalance("person1"))}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-pink-100 text-pink-600 text-xs">
                        {couple.person2_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {couple.person2_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-pink-600">{formatCurrency(getPersonBalance("person2"))}</div>
                </CardContent>
              </Card>
            </div>

            {/* Botón Agregar Transacción */}
            <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, type: value as "income" | "expense", category: "" })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="income">Ingreso</TabsTrigger>
                      <TabsTrigger value="expense">Gasto</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="person">Persona</Label>
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
                    <Label htmlFor="amount">Monto (COP)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Descripción de la transacción"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
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

                  <Button onClick={handleAddTransaction} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      "Agregar Transacción"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Lista de Transacciones Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay transacciones aún</p>
                    <p className="text-sm">Agrega tu primera transacción</p>
                  </div>
                ) : (
                  transactions.slice(0, 10).map((transaction) => {
                    const IconComponent = getCategoryIcon(transaction.category, transaction.type)
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                          >
                            <IconComponent
                              className={`h-4 w-4 ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{transaction.description}</div>
                            <div className="text-xs text-gray-500">
                              {getCategoryName(transaction.category, transaction.type)} •
                              {transaction.person === "person1" ? ` ${couple.person1_name}` : ` ${couple.person2_name}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
            <StatisticsDashboard coupleId={couple.id} />
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
