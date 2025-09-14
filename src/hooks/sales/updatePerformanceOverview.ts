import { Sale } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
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

    // Helper function to aggregate sales by channel for a time period
    const aggregateSalesByChannel = async (startDate: Date, endDate: Date) => {
      const channelTotals = await payload.db.collections['sales'].aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
            deletedAt: { $exists: false }, // Exclude soft-deleted records
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

      return channelTotals.map(({ channel, total }) => ({
        channel: getChannelLabel(channel),
        total,
      }))
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate sales for all time periods
    const [todaySales, thisMonthSales, lastMonthSales, thisWeekSales, thisQuarterSales, thisYearSales] = await Promise.all([
      aggregateSalesByChannel(todayStart, todayEnd),
      aggregateSalesByChannel(thisMonthStart, thisMonthEnd),
      aggregateSalesByChannel(lastMonthStart, lastMonthEnd),
      aggregateSalesByChannel(thisWeekStart, thisWeekEnd),
      aggregateSalesByChannel(thisQuarterStart, thisQuarterEnd),
      aggregateSalesByChannel(thisYearStart, thisYearEnd),
    ])

    // Helper function to update revenue for a time period
    const updateRevenueForPeriod = (period: any, salesChannels: any[]) => {
      if (!period) return period

      // Get existing channels and preserve non-sales channels (like "Delivery")
      const existingChannels = period.revenue?.channels || []
      const nonSalesChannels = existingChannels.filter(
        (channel: any) => !['Counter Sales', 'Filler', 'Bottles Sold', 'Other'].includes(channel.channel)
      )

      // Combine sales channels with preserved non-sales channels
      const updatedChannels = [...salesChannels, ...nonSalesChannels]

      // Calculate totals
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
        today: updateRevenueForPeriod(performanceOverview.today, todaySales),
        thisMonth: updateRevenueForPeriod(performanceOverview.thisMonth, thisMonthSales),
        lastMonth: updateRevenueForPeriod(performanceOverview.lastMonth, lastMonthSales),
        thisWeek: updateRevenueForPeriod(performanceOverview.thisWeek, thisWeekSales),
        thisQuarter: updateRevenueForPeriod(performanceOverview.thisQuarter, thisQuarterSales),
        thisYear: updateRevenueForPeriod(performanceOverview.thisYear, thisYearSales),
      },
    })

    console.log('✅ Performance overview updated with sales data for all time periods (including today)')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the sales creation/update
  }
  return doc;
}
