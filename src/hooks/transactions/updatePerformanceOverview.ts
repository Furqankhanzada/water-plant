import { Transaction } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

/**
 * 🔄 Hook: updatePerformanceOverview (After Change)
 *
 * This hook runs after creating or updating a Transaction. It calculates bottles
 * delivered metrics for the current month and updates the performance overview global.
 *
 * 1. 🍼 Aggregates transactions for the current month
 * 2. 📊 Calculates total bottles delivered, expected revenue, and average revenue
 * 3. 🔄 Updates the performance overview global
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  req,
}) => {
  try {
    const payload = req.payload
    const currentDate = new Date()
    
    // Calculate date ranges for all time periods
    const thisMonthStart = startOfMonth(currentDate)
    const thisMonthEnd = endOfMonth(currentDate)
    
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1))
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1))
    
    const thisWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
    const thisWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }) // Sunday

    // Helper function to aggregate bottles delivered for a time period
    const aggregateBottlesDelivered = async (startDate: Date, endDate: Date) => {
      const result = await payload.db.collections['transaction'].aggregate([
        {
          $match: {
            transactionAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalBottlesDelivered: { $sum: '$bottleGiven' },
            totalExpectedIncome: { $sum: '$total' },
          },
        },
      ])

      const bottlesData = result[0] || {
        totalBottlesDelivered: 0,
        totalExpectedIncome: 0,
      }

      const totalBottles = bottlesData.totalBottlesDelivered
      const expectedRevenue = bottlesData.totalExpectedIncome
      const averageRevenue = totalBottles > 0 ? expectedRevenue / totalBottles : 0

      return {
        total: totalBottles,
        expectedRevenue: expectedRevenue,
        averageRevenue: averageRevenue,
      }
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Calculate bottles delivered metrics for all time periods
    const [thisMonthBottles, lastMonthBottles, thisWeekBottles] = await Promise.all([
      aggregateBottlesDelivered(thisMonthStart, thisMonthEnd),
      aggregateBottlesDelivered(lastMonthStart, lastMonthEnd),
      aggregateBottlesDelivered(thisWeekStart, thisWeekEnd),
    ])

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        thisMonth: {
          ...performanceOverview.thisMonth,
          bottlesDelivered: thisMonthBottles,
        },
        lastMonth: {
          ...performanceOverview.lastMonth,
          bottlesDelivered: lastMonthBottles,
        },
        thisWeek: {
          ...performanceOverview.thisWeek,
          bottlesDelivered: thisWeekBottles,
        },
      },
    })

    console.log('✅ Performance overview updated with bottles delivered metrics for all time periods')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the transaction creation/update
  }
}
