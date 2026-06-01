import type { TaskConfig } from 'payload'
import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'

import {
  calculateDeliveryRevenue,
  calculateGeographicCollection,
  calculateInvoiceSalesRevenue,
  calculatePaymentMethodBreakdown,
} from '@/lib/performanceAggregations'

const recalculatePerformanceOverview = async (payload: any) => {
  const currentDate = new Date()

  const todayStart = startOfDay(currentDate)
  const todayEnd = endOfDay(currentDate)

  const thisMonthStart = startOfMonth(currentDate)
  const thisMonthEnd = endOfMonth(currentDate)

  const lastMonthStart = startOfMonth(subMonths(currentDate, 1))
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1))

  const thisWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  const thisQuarterStart = startOfQuarter(currentDate)
  const thisQuarterEnd = endOfQuarter(currentDate)

  const thisYearStart = startOfYear(currentDate)
  const thisYearEnd = endOfYear(currentDate)

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

  const performanceOverview = await payload.findGlobal({
    slug: 'performance-overview',
  })

  const [todayRevenue, thisMonthRevenue, lastMonthRevenue, thisWeekRevenue, thisQuarterRevenue, thisYearRevenue] = await Promise.all([
    aggregateRevenueEnhanced(todayStart, todayEnd),
    aggregateRevenueEnhanced(thisMonthStart, thisMonthEnd),
    aggregateRevenueEnhanced(lastMonthStart, lastMonthEnd),
    aggregateRevenueEnhanced(thisWeekStart, thisWeekEnd),
    aggregateRevenueEnhanced(thisQuarterStart, thisQuarterEnd),
    aggregateRevenueEnhanced(thisYearStart, thisYearEnd),
  ])

  const getSalesChannelLabel = (channel: string): string => {
    const channelLabels: Record<string, string> = {
      filler: 'Filler',
      shop: 'Bottles Sold',
      bottles: 'Bottles Sold',
    }
    return channelLabels[channel] || channel
  }

  const updateRevenueForPeriod = (period: any, revenueData: any) => {
    if (!period) return period

    const existingChannels = period.revenue?.channels || []
    const channelsToRemove = ['Delivery', 'Filler', 'Bottles Sold', 'shop']
    const channelsWithoutInvoice = existingChannels.filter(
      (channel: any) => !channelsToRemove.includes(channel.channel),
    )

    const updatedChannels = [
      ...channelsWithoutInvoice,
      {
        channel: 'Delivery',
        total: revenueData.delivery.total,
        paymentMethods: revenueData.delivery.paymentMethods,
        areas: revenueData.delivery.areas,
      },
    ]

    revenueData.sales.forEach((salesChannel: any) => {
      updatedChannels.push({
        channel: getSalesChannelLabel(salesChannel.channel),
        total: salesChannel.total,
      })
    })

    const totalRevenue = updatedChannels.reduce((sum, { total }) => sum + total, 0)

    return {
      ...period,
      revenue: {
        total: totalRevenue,
        channels: updatedChannels,
      },
    }
  }

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
}

export const updatePerformanceOverviewTask: TaskConfig<'updatePerformanceOverview'> = {
  slug: 'updatePerformanceOverview',
  inputSchema: [],
  handler: async ({ req }) => {
    await recalculatePerformanceOverview(req.payload)
    return { output: {} }
  },
}
