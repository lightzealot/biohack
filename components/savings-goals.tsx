"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Target, Plus, Calendar, Trash2, CheckCircle, RefreshCw } from "lucide-react"
import { getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, type SavingsGoal } from "@/lib/supabase"

interface SavingsGoalsProps {
  coupleId: string
}

const goalCategories = [
  { id: "travel", name: "Viajes", icon: "✈️" },
  { id: "emergency", name: "Emergencia", icon: "🚨" },
  { id: "home", name: "Hogar", icon: "🏠" },
  { id: "education", name: "Educación", icon: "📚" },
  { id: "health", name: "Salud", icon: "🏥" },
  { id: "general", name: "General", icon: "💰" },
]

export function SavingsGoals({ coupleId }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    category: "general",
  })
  const { toast } = useToast()
  const [missingTable, setMissingTable] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [coupleId])

  const loadGoals = async () => {
    try {
      setLoading(true)
      setMissingTable(false) // Reset el estado de tabla faltante
      const data = await getSavingsGoals(coupleId)
      setGoals(data)
    } catch (error: any) {
      console.error("Error loading goals:", error)
      // Detectamos si la tabla no existe (código 42P01) o mensaje específico
      if (error?.code === "42P01" || error?.message?.includes('relation "savings_goals" does not exist')) {
        setMissingTable(true)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las metas de ahorro.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const goal = {
        couple_id: coupleId,
        title: newGoal.title,
        target_amount: Number.parseInt(newGoal.target_amount),
        current_amount: 0,
        target_date: newGoal.target_date || null,
        category: newGoal.category,
        is_completed: false,
      }

      const addedGoal = await addSavingsGoal(goal)
      setGoals([addedGoal, ...goals])

      setNewGoal({
        title: "",
        target_amount: "",
        target_date: "",
        category: "general",
      })
      setIsAddingGoal(false)

      toast({
        title: "¡Éxito!",
        description: "Meta de ahorro creada correctamente.",
      })
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la meta de ahorro.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProgress = async (goalId: string, newAmount: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return

      const isCompleted = newAmount >= goal.target_amount
      const updatedGoal = await updateSavingsGoal(goalId, {
        current_amount: newAmount,
        is_completed: isCompleted,
      })

      setGoals(goals.map((g) => (g.id === goalId ? updatedGoal : g)))

      if (isCompleted && !goal.is_completed) {
        toast({
          title: "¡Meta alcanzada! 🎉",
          description: `Has completado la meta "${goal.title}"`,
        })
      }
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la meta.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteSavingsGoal(goalId)
      setGoals(goals.filter((g) => g.id !== goalId))
      toast({
        title: "Eliminado",
        description: "Meta de ahorro eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la meta.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha límite"
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return goalCategories.find((c) => c.id === categoryId) || goalCategories[5]
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  /* ----- Tabla inexistente ----- */
  if (missingTable) {
    return (
      <Card className="mt-6">
        <CardContent className="text-center py-12 space-y-4">
          <Target className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700">
            Debes crear la tabla <code>savings_goals</code>
          </h3>
          <p className="text-gray-500">
            Ejecuta el script&nbsp;
            <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">scripts/add-savings-goals.sql</code> en tu
            proyecto de Supabase y vuelve a recargar la app.
          </p>
          <Button onClick={loadGoals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)

  return (
    <div className="space-y-6">
      {/* Header con botón agregar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-purple-800">Metas de Ahorro</h2>
          <p className="text-purple-600">Planifica y alcanza tus objetivos financieros</p>
        </div>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la meta</Label>
                <Input
                  id="title"
                  placeholder="Ej: Vacaciones en Cartagena"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_amount">Monto objetivo (COP)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  placeholder="0"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Fecha objetivo (opcional)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>

              <Button onClick={handleAddGoal} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metas Activas */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Metas Activas</h3>
          {activeGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            const percentage = getProgressPercentage(goal.current_amount, goal.target_amount)
            const daysRemaining = getDaysRemaining(goal.target_date)

            return (
              <Card key={goal.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-gray-600">{categoryInfo.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progreso</span>
                      <Badge variant={percentage >= 100 ? "default" : "secondary"}>{percentage.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-semibold">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-gray-600">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>

                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(goal.target_date)}</span>
                      {daysRemaining !== null && (
                        <Badge variant={daysRemaining < 30 ? "destructive" : "outline"} className="text-xs">
                          {daysRemaining > 0 ? `${daysRemaining} días` : "Vencida"}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Agregar monto"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement
                          const newAmount = goal.current_amount + Number.parseInt(input.value || "0")
                          handleUpdateProgress(goal.id, newAmount)
                          input.value = ""
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector(
                          "input",
                        ) as HTMLInputElement
                        const newAmount = goal.current_amount + Number.parseInt(input?.value || "0")
                        handleUpdateProgress(goal.id, newAmount)
                        if (input) input.value = ""
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Metas Completadas */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Metas Completadas
          </h3>
          {completedGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)

            return (
              <Card key={goal.id} className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <div>
                        <h4 className="font-semibold text-green-800">{goal.title}</h4>
                        <p className="text-sm text-green-600">
                          {formatCurrency(goal.target_amount)} • {categoryInfo.name}
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Estado vacío */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes metas de ahorro aún</h3>
            <p className="text-gray-500 mb-4">Crea tu primera meta y comienza a ahorrar para tus objetivos</p>
            <Button onClick={() => setIsAddingGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
