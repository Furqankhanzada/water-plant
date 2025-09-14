import { Invoice } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
import { 
  calculatePaymentMethodBreakdown, 
  calculateGeographicCollection, 
  calculateDeliveryRevenue 
} from '@/lib/performanceAggregations'

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

    // Helper function to aggregate delivery revenue with enhanced breakdown for a time period
    const aggregateDeliveryRevenueEnhanced = async (startDate: Date, endDate: Date) => {
      const [totalRevenue, paymentMethods, geographicData] = await Promise.all([
        calculateDeliveryRevenue(payload, startDate, endDate),
        calculatePaymentMethodBreakdown(payload, startDate, endDate),
        calculateGeographicCollection(payload, startDate, endDate),
      ])

      return {
        total: totalRevenue,
        paymentMethods,
        areas: geographicData,
      }
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Aggregate delivery revenue for all time periods with enhanced breakdown
    const [todayDelivery, thisMonthDelivery, lastMonthDelivery, thisWeekDelivery, thisQuarterDelivery, thisYearDelivery] = await Promise.all([
      aggregateDeliveryRevenueEnhanced(todayStart, todayEnd),
      aggregateDeliveryRevenueEnhanced(thisMonthStart, thisMonthEnd),
      aggregateDeliveryRevenueEnhanced(lastMonthStart, lastMonthEnd),
      aggregateDeliveryRevenueEnhanced(thisWeekStart, thisWeekEnd),
      aggregateDeliveryRevenueEnhanced(thisQuarterStart, thisQuarterEnd),
      aggregateDeliveryRevenueEnhanced(thisYearStart, thisYearEnd),
    ])

    // Helper function to update revenue for a time period with enhanced breakdown
    const updateRevenueForPeriod = (period: any, deliveryData: any) => {
      if (!period) return period

      // Get existing channels and preserve them
      const existingChannels = period.revenue?.channels || []
      
      // Remove any existing "Delivery" channel to avoid duplicates
      const channelsWithoutDelivery = existingChannels.filter(
        (channel: any) => channel.channel !== 'Delivery'
      )

      // Add the new "Delivery" channel with enhanced breakdown
      const updatedChannels = [
        ...channelsWithoutDelivery,
        {
          channel: 'Delivery',
          total: deliveryData.total,
          paymentMethods: deliveryData.paymentMethods,
          areas: deliveryData.areas,
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
        today: updateRevenueForPeriod(performanceOverview.today, todayDelivery),
        thisMonth: updateRevenueForPeriod(performanceOverview.thisMonth, thisMonthDelivery),
        lastMonth: updateRevenueForPeriod(performanceOverview.lastMonth, lastMonthDelivery),
        thisWeek: updateRevenueForPeriod(performanceOverview.thisWeek, thisWeekDelivery),
        thisQuarter: updateRevenueForPeriod(performanceOverview.thisQuarter, thisQuarterDelivery),
        thisYear: updateRevenueForPeriod(performanceOverview.thisYear, thisYearDelivery),
      },
    })

    console.log('✅ Performance overview updated with delivery revenue for all time periods (including today)')
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the invoice creation/update
  }
  return doc;
}
