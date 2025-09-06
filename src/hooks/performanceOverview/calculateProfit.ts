import type { GlobalBeforeChangeHook } from 'payload'

/**
 * 🔄 Hook: calculateProfit (Before Change)
 *
 * This hook runs before updating the PerformanceOverview global. It automatically
 * calculates the profit from revenue.total and expenses.total.
 *
 * 1. 📊 Reads revenue.total and expenses.total from the data
 * 2. 🧮 Calculates profit = revenue.total - expenses.total
 * 3. 💰 Sets the calculated profit in the data
 */

export const calculateProfit: GlobalBeforeChangeHook = async ({
  data,
}) => {
  try {
    // Get revenue and expenses totals
    const revenueTotal = data.thisMonth?.revenue?.total || 0
    const expensesTotal = data.thisMonth?.expenses?.total || 0

    // Calculate profit
    const profit = revenueTotal - expensesTotal

    // Set the calculated profit in the data
    if (data.thisMonth) {
      data.thisMonth.profit = profit
    }

    console.log(`✅ Profit calculated: ${profit} (Revenue: ${revenueTotal} - Expenses: ${expensesTotal})`)
  } catch (error) {
    console.error('❌ Error calculating profit:', error)
    // Don't throw the error to avoid breaking the global update
  }

  return data
}
