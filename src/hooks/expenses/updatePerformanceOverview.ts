import { Expense } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
import { Expenses } from '@/collections/Expenses'

/**
 * Helper function to map expense type values to labels
 */
const getExpenseTypeLabel = (value: string): string => {
  const typeField = Expenses.fields.find(field => 
    'name' in field && field.name === 'type'
  )
  if (typeField && 'options' in typeField) {
    const option = typeField.options.find(opt => 
      typeof opt === 'object' && 'value' in opt && opt.value === value
    )
    return (option && typeof option === 'object' && 'label' in option) 
      ? option.label as string 
      : value
  }
  return value
}

/**
 * 🔄 Hook: updatePerformanceOverview (After Change)
 *
 * This hook runs after creating or updating an Expense. It calculates expense
 * metrics for the current month and updates the performance overview global.
 *
 * 1. 💸 Aggregates expenses by type for the current month
 * 2. 🔄 Updates the performance overview global
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Expense> = async ({
  doc,
  req,
}) => {
  try {
    const payload = req.payload
    const currentDate = new Date()
    
    // Calculate date ranges for all time periods
    const todayStart = startOfDay(currentDate)
    const todayEnd = endOfDay(currentDate)
    
    const thisMonthStart = startOfMonth(currentDate)
    const thisMonthEnd = endOfMonth(currentDate)
    
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1))
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1))
    
    const thisWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
    const thisWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }) // Sunday
    
    const thisQuarterStart = startOfQuarter(currentDate)
    const thisQuarterEnd = endOfQuarter(currentDate)
    
    const thisYearStart = startOfYear(currentDate)
    const thisYearEnd = endOfYear(currentDate)

    // Helper function to aggregate expenses by type for a time period
    const aggregateExpensesByType = async (startDate: Date, endDate: Date) => {
      const expenseTotals = await payload.db.collections['expenses'].aggregate([
        {
          $match: {
            expenseAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
        {
          $project: {
            type: '$_id',
            total: 1,
            _id: 0,
          },
        },
      ])

      // Update the expense types with aggregated data (using labels instead of values)
      const updatedExpenseTypes = expenseTotals.map(({ type, total }) => ({
        type: getExpenseTypeLabel(type),
        total,
      }))

      // Calculate totals
      const totalExpenses = expenseTotals.reduce((sum, { total }) => sum + total, 0)

      return {
        total: totalExpenses,
        types: updatedExpenseTypes,
      }
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate expenses for all time periods
    const [todayExpenses, thisMonthExpenses, lastMonthExpenses, thisWeekExpenses, thisQuarterExpenses, thisYearExpenses] = await Promise.all([
      aggregateExpensesByType(todayStart, todayEnd),
      aggregateExpensesByType(thisMonthStart, thisMonthEnd),
      aggregateExpensesByType(lastMonthStart, lastMonthEnd),
      aggregateExpensesByType(thisWeekStart, thisWeekEnd),
      aggregateExpensesByType(thisQuarterStart, thisQuarterEnd),
      aggregateExpensesByType(thisYearStart, thisYearEnd),
    ])

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        today: {
          ...performanceOverview.today,
          expenses: todayExpenses,
        },
        thisMonth: {
          ...performanceOverview.thisMonth,
          expenses: thisMonthExpenses,
        },
        lastMonth: {
          ...performanceOverview.lastMonth,
          expenses: lastMonthExpenses,
        },
        thisWeek: {
          ...performanceOverview.thisWeek,
          expenses: thisWeekExpenses,
        },
        thisQuarter: {
          ...performanceOverview.thisQuarter,
          expenses: thisQuarterExpenses,
        },
        thisYear: {
          ...performanceOverview.thisYear,
          expenses: thisYearExpenses,
        },
      },
    })

    console.log('✅ Performance overview updated with expenses data for all time periods (including today)')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the expense creation/update
  }
  return doc;
}
