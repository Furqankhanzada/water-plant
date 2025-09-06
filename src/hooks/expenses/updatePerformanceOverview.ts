import { Expense } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth } from 'date-fns'
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
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate expenses by type for the current month
    const expenseTotals = await payload.db.collections['expenses'].aggregate([
      {
        $match: {
          expenseAt: {
            $gte: monthStart,
            $lte: monthEnd,
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

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        thisMonth: {
          ...performanceOverview.thisMonth,
          expenses: {
            total: totalExpenses,
            types: updatedExpenseTypes,
          },
        },
      },
    })

    console.log('✅ Performance overview updated with current month data')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the expense creation/update
  }
}
