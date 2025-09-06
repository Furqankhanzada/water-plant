import { Invoice } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth } from 'date-fns'

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
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Aggregate invoice payments for the current month (similar to generateReport.ts)
    const deliveryRevenue = await payload.db.collections['invoice'].aggregate([
      {
        $unwind: '$payments',
      },
      {
        $match: {
          'payments.paidAt': {
            $gte: monthStart,
            $lte: monthEnd,
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

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Calculate delivery revenue
    const deliveryTotal = deliveryRevenue[0]?.totalDelivery || 0

    // Get existing channels and preserve them
    const existingChannels = performanceOverview.thisMonth?.revenue?.channels || []
    
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

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        thisMonth: {
          ...performanceOverview.thisMonth,
          revenue: {
            total: totalRevenue,
            channels: updatedChannels,
          },
        },
      },
    })

    console.log('✅ Performance overview updated with delivery revenue')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the invoice creation/update
  }
}
