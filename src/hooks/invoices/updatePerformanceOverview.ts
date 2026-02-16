import { Invoice } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
import { 
  calculatePaymentMethodBreakdown, 
  calculateGeographicCollection, 
  calculateDeliveryRevenue,
  calculateInvoiceSalesRevenue
} from '@/lib/performanceAggregations'

/**
 * 🔄 Hook: updatePerformanceOverview (After Change)
 *
 * This hook runs after creating or updating an Invoice. It calculates delivery
 * revenue from invoice payments and sales revenue from invoice transactions
 * for the current month and updates the performance overview global.
 *
 * 1. 💰 Aggregates invoice payments for the current month (Delivery channel)
 * 2. 💰 Aggregates sales revenue from invoice transactions (Filler/Bottles channels)
 * 3. 🔄 Updates the performance overview global with all channels
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Invoice> = async ({
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

    // Helper function to aggregate delivery revenue and sales revenue with enhanced breakdown for a time period
    const aggregateRevenueEnhanced = async (startDate: Date, endDate: Date) => {
      const [deliveryRevenue, paymentMethods, geographicData, salesRevenue] = await Promise.all([
        calculateDeliveryRevenue(payload, startDate, endDate),
        calculatePaymentMethodBreakdown(payload, startDate, endDate),
        calculateGeographicCollection(payload, startDate, endDate),
        calculateInvoiceSalesRevenue(payload, startDate, endDate),
      ])

      return {
        delivery: {
          total: deliveryRevenue,
          paymentMethods,
          areas: geographicData,
        },
        sales: salesRevenue,
      }
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate revenue for all time periods with enhanced breakdown
    const [todayRevenue, thisMonthRevenue, lastMonthRevenue, thisWeekRevenue, thisQuarterRevenue, thisYearRevenue] = await Promise.all([
      aggregateRevenueEnhanced(todayStart, todayEnd),
      aggregateRevenueEnhanced(thisMonthStart, thisMonthEnd),
      aggregateRevenueEnhanced(lastMonthStart, lastMonthEnd),
      aggregateRevenueEnhanced(thisWeekStart, thisWeekEnd),
      aggregateRevenueEnhanced(thisQuarterStart, thisQuarterEnd),
      aggregateRevenueEnhanced(thisYearStart, thisYearEnd),
    ])

    // Helper function to map sales channel values to labels
    const getSalesChannelLabel = (channel: string): string => {
      const channelLabels: Record<string, string> = {
        'filler': 'Filler',
        'shop': 'Bottles Sold',
        'bottles': 'Bottles Sold'
      }
      return channelLabels[channel] || channel
    }

    // Helper function to update revenue for a time period with enhanced breakdown
    const updateRevenueForPeriod = (period: any, revenueData: any) => {
      if (!period) return period

      // Get existing channels and preserve them
      const existingChannels = period.revenue?.channels || []
      
      // Remove any existing invoice-related channels to avoid duplicates
      const channelsToRemove = ['Delivery', 'Filler', 'Bottles Sold', 'shop']
      const channelsWithoutInvoice = existingChannels.filter(
        (channel: any) => !channelsToRemove.includes(channel.channel)
      )

      // Add the new "Delivery" channel with enhanced breakdown
      const updatedChannels = [
        ...channelsWithoutInvoice,
        {
          channel: 'Delivery',
          total: revenueData.delivery.total,
          paymentMethods: revenueData.delivery.paymentMethods,
          areas: revenueData.delivery.areas,
        },
      ]

      // Add sales channels (Filler and Bottles Sold)
      revenueData.sales.forEach((salesChannel: any) => {
        updatedChannels.push({
          channel: getSalesChannelLabel(salesChannel.channel),
          total: salesChannel.total,
        })
      })

      // Calculate total revenue including delivery and sales
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
        today: updateRevenueForPeriod(performanceOverview.today, todayRevenue),
        thisMonth: updateRevenueForPeriod(performanceOverview.thisMonth, thisMonthRevenue),
        lastMonth: updateRevenueForPeriod(performanceOverview.lastMonth, lastMonthRevenue),
        thisWeek: updateRevenueForPeriod(performanceOverview.thisWeek, thisWeekRevenue),
        thisQuarter: updateRevenueForPeriod(performanceOverview.thisQuarter, thisQuarterRevenue),
        thisYear: updateRevenueForPeriod(performanceOverview.thisYear, thisYearRevenue),
      },
    })

    console.log('✅ Performance overview updated with delivery and sales revenue for all time periods (including today)')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the invoice creation/update
  }
  return doc;
}
