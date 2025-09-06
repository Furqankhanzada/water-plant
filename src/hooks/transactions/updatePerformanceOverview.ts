import { Transaction } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth } from 'date-fns'

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
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Aggregate transactions for the current month (same logic as generateReport.ts)
    const bottlesDelivered = await payload.db.collections['transaction'].aggregate([
      {
        $match: {
          transactionAt: { $gte: monthStart, $lte: monthEnd },
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

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Calculate bottles delivered metrics
    const bottlesData = bottlesDelivered[0] || {
      totalBottlesDelivered: 0,
      totalExpectedIncome: 0,
    }

    const totalBottles = bottlesData.totalBottlesDelivered
    const expectedRevenue = bottlesData.totalExpectedIncome
    const averageRevenue = totalBottles > 0 ? expectedRevenue / totalBottles : 0

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        thisMonth: {
          ...performanceOverview.thisMonth,
          bottlesDelivered: {
            total: totalBottles,
            expectedRevenue: expectedRevenue,
            averageRevenue: averageRevenue,
          },
        },
      },
    })

    console.log('✅ Performance overview updated with bottles delivered metrics')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the transaction creation/update
  }
}
