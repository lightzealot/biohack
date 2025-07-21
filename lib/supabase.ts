import { createClient } from "@supabase/supabase-js"

// Supabase URL and anon key from environment (must be set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Transaction {
  id: string
  couple_id: string
  amount: number
  description: string
  category: string
  type: "income" | "expense"
  person: "person1" | "person2"
  transaction_date: string
  created_at: string
}

export interface Couple {
  id: string
  name: string
  person1_name: string
  person2_name: string
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: string
  couple_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  category: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface MonthlyBudget {
  id: string
  couple_id: string
  category: string
  budget_amount: number
  month_year: string
  created_at: string
}

export interface CategoryStats {
  category: string
  amount: number
  budget: number
  percentage: number
}

// Funciones para transacciones
export async function getTransactions(coupleId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data || []
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "created_at">) {
  const { data, error } = await supabase.from("transactions").insert([transaction]).select().single()

  if (error) {
    console.error("Error adding transaction:", error)
    throw error
  }

  return data
}

export async function updateTransaction(id: string, updates: Partial<Omit<Transaction, "id" | "created_at">>) {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating transaction:", error)
    throw error
  }

  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting transaction:", error)
    throw error
  }
}

// Funciones para parejas
export async function getCouples() {
  const { data, error } = await supabase.from("couples").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching couples:", error)
    return []
  }

  return data || []
}

export async function getCouple(id: string) {
  const { data, error } = await supabase.from("couples").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching couple:", error)
    return null
  }

  return data
}

// Funciones para metas de ahorro
export async function getSavingsGoals(coupleId: string) {
  try {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching savings goals:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getSavingsGoals:", error)
    throw error
  }
}

export async function addSavingsGoal(goal: Omit<SavingsGoal, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("savings_goals").insert([goal]).select().single()

  if (error) {
    console.error("Error adding savings goal:", error)
    throw error
  }

  return data
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>) {
  const { data, error } = await supabase
    .from("savings_goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating savings goal:", error)
    throw error
  }

  return data
}

export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id)

  if (error) {
    console.error("Error deleting savings goal:", error)
    throw error
  }
}

// Funciones para estadísticas
export async function getCategoryStats(coupleId: string, monthYear: string): Promise<CategoryStats[]> {
  try {
    // Obtener gastos del mes por categoría
    const { data: expenses } = await supabase
      .from("transactions")
      .select("category, amount")
      .eq("couple_id", coupleId)
      .eq("type", "expense")
      .gte("transaction_date", `${monthYear}-01`)
      .lt("transaction_date", getNextMonth(monthYear))

    // Obtener presupuestos del mes
    const { data: budgets } = await supabase
      .from("monthly_budgets")
      .select("category, budget_amount")
      .eq("couple_id", coupleId)
      .eq("month_year", monthYear)

    // Procesar datos
    const expensesByCategory = (expenses || []).reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const budgetsByCategory = (budgets || []).reduce(
      (acc, budget) => {
        acc[budget.category] = budget.budget_amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Combinar datos
    const categories = new Set([...Object.keys(expensesByCategory), ...Object.keys(budgetsByCategory)])

    return Array.from(categories)
      .map((category) => {
        const amount = expensesByCategory[category] || 0
        const budget = budgetsByCategory[category] || 0
        const percentage = budget > 0 ? (amount / budget) * 100 : 0

        return {
          category,
          amount,
          budget,
          percentage,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  } catch (error) {
    console.error("Error getting category stats:", error)
    return []
  }
}

export async function getMonthlyTrends(coupleId: string, months = 6) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, transaction_date")
    .eq("couple_id", coupleId)
    .gte("transaction_date", startDate.toISOString().split("T")[0])
    .lte("transaction_date", endDate.toISOString().split("T")[0])
    .order("transaction_date", { ascending: true })

  if (error) {
    console.error("Error fetching monthly trends:", error)
    return []
  }

  // Agrupar por mes
  const monthlyData = (data || []).reduce(
    (acc, transaction) => {
      const month = transaction.transaction_date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        acc[month].income += transaction.amount
      } else {
        acc[month].expenses += transaction.amount
      }

      return acc
    },
    {} as Record<string, { income: number; expenses: number }>,
  )

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// Función auxiliar
function getNextMonth(monthYear: string): string {
  const [year, month] = monthYear.split("-").map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01`
}

export async function logout() {
  await supabase.auth.signOut();
  alert("Sesión cerrada");
}
