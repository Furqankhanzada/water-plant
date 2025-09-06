import { Invoice } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

/**
 * 🔄 Hook: updatePerformanceOverview (After Change)
 *
 * This hook runs after creating or updating an Invoice. It calculates delivery
 * revenue from invoice payments for the current month and updates the performance
 * overview global.
 *
 * 1. 💰 Aggregates invoice payments for the current month
 * 2. 🔄 Updates the performance overview global with "Delivery" channel
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Invoice> = async ({
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

    // Helper function to aggregate delivery revenue for a time period
    const aggregateDeliveryRevenue = async (startDate: Date, endDate: Date) => {
      const deliveryRevenue = await payload.db.collections['invoice'].aggregate([
        {
          $unwind: '$payments',
        },
        {
          $match: {
            'payments.paidAt': {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalDelivery: { $sum: '$payments.amount' },
          },
        },
      ])

      return deliveryRevenue[0]?.totalDelivery || 0
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate delivery revenue for all time periods
    const [thisMonthDelivery, lastMonthDelivery, thisWeekDelivery] = await Promise.all([
      aggregateDeliveryRevenue(thisMonthStart, thisMonthEnd),
      aggregateDeliveryRevenue(lastMonthStart, lastMonthEnd),
      aggregateDeliveryRevenue(thisWeekStart, thisWeekEnd),
    ])

    // Helper function to update revenue for a time period
    const updateRevenueForPeriod = (period: any, deliveryTotal: number) => {
      if (!period) return period

      // Get existing channels and preserve them
      const existingChannels = period.revenue?.channels || []
      
      // Remove any existing "Delivery" channel to avoid duplicates
      const channelsWithoutDelivery = existingChannels.filter(
        (channel: any) => channel.channel !== 'Delivery'
      )

      // Add the new "Delivery" channel
      const updatedChannels = [
        ...channelsWithoutDelivery,
        {
          channel: 'Delivery',
          total: deliveryTotal,
        },
      ]

      // Calculate total revenue including delivery
      const totalRevenue = updatedChannels.reduce((sum, { total }) => sum + total, 0)

      return {
        ...period,
        revenue: {
          total: totalRevenue,
          channels: updatedChannels,
        },
      }
    }

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        thisMonth: updateRevenueForPeriod(performanceOverview.thisMonth, thisMonthDelivery),
        lastMonth: updateRevenueForPeriod(performanceOverview.lastMonth, lastMonthDelivery),
        thisWeek: updateRevenueForPeriod(performanceOverview.thisWeek, thisWeekDelivery),
      },
    })

    console.log('✅ Performance overview updated with delivery revenue for all time periods')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the invoice creation/update
  }
}
