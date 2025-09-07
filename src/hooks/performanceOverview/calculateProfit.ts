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
    // Helper function to calculate profit for a time period
    const calculateProfitForPeriod = (period: any) => {
      if (!period) return
      
      const revenueTotal = period.revenue?.total || 0
      const expensesTotal = period.expenses?.total || 0
      const profit = revenueTotal - expensesTotal
      
      period.profit = profit
      return profit
    }

    // Calculate profit for all time periods
    const thisMonthProfit = calculateProfitForPeriod(data.thisMonth)
    const lastMonthProfit = calculateProfitForPeriod(data.lastMonth)
    const thisWeekProfit = calculateProfitForPeriod(data.thisWeek)
    const thisQuarterProfit = calculateProfitForPeriod(data.thisQuarter)
    const thisYearProfit = calculateProfitForPeriod(data.thisYear)

    console.log(`✅ Profit calculated - This Month: ${thisMonthProfit}, Last Month: ${lastMonthProfit}, This Week: ${thisWeekProfit}, This Quarter: ${thisQuarterProfit}, This Year: ${thisYearProfit}`)
  } catch (error) {
    console.error('❌ Error calculating profit:', error)
    // Don't throw the error to avoid breaking the global update
  }

  return data
}
