import { Sale } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Sales } from '@/collections/Sales'

/**
 * Helper function to map channel values to labels
 */
const getChannelLabel = (value: string): string => {
  const channelField = Sales.fields.find(field => 
    'name' in field && field.name === 'channel'
  )
  if (channelField && 'options' in channelField) {
    const option = channelField.options.find(opt => 
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
 * This hook runs after creating or updating a Sale. It calculates revenue
 * metrics for the current month and updates the performance overview global.
 *
 * 1. 📊 Aggregates sales data by channel for the current month
 * 2. 💰 Calculates total revenue per channel
 * 3. 🔄 Updates the performance overview global
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Sale> = async ({
  doc,
  req,
}) => {
  try {
    const payload = req.payload
    const currentDate = new Date()
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Aggregate sales by channel for the current month
    const channelTotals = await payload.db.collections['sales'].aggregate([
      {
        $match: {
          date: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        },
      },
      {
        $group: {
          _id: '$channel',
          total: { $sum: '$totals.gross' },
        },
      },
      {
        $project: {
          channel: '$_id',
          total: 1,
          _id: 0,
        },
      },
    ])



    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Get existing channels and preserve non-sales channels (like "Delivery")
    const existingChannels = performanceOverview.thisMonth?.revenue?.channels || []
    const nonSalesChannels = existingChannels.filter(
      (channel: any) => !['Counter Sales', 'Filler', 'Bottles Sold', 'Other'].includes(channel.channel)
    )

    // Update the revenue channels with aggregated data (using labels instead of values)
    const salesChannels = channelTotals.map(({ channel, total }) => ({
      channel: getChannelLabel(channel),
      total,
    }))

    // Combine sales channels with preserved non-sales channels
    const updatedChannels = [...salesChannels, ...nonSalesChannels]

    // Calculate totals
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

    console.log('✅ Performance overview updated with current month data')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the sales creation/update
  }
}
