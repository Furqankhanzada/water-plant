import React from 'react'
import { CustomComponent, PayloadServerReactComponent } from 'payload'
import { PerformanceOverview } from '@/payload-types'
import { rupee } from '@/collections/Reports'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns'

import { Filters } from './Filters'
import { OverviewCard } from './OverviewCard'
import { BarChartHorizontal } from './BarChartHorizontal'
import { PaymentMethodBreakdown } from './PaymentMethodBreakdown'
import { GeographicCollection } from './GeographicCollection'

/**
 * Generate readable date range for a given duration
 */
const getDateRangeForDuration = (duration: string): string => {
  const currentDate = new Date()

  switch (duration) {
    case 'today': {
      // Show: "Jan 15, 2024"
      return format(currentDate, 'MMM d, yyyy')
    }
    case 'this-week': {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 }) // Sunday
      // If same month, show: "Jan 1 - 7, 2024"
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
      }
      // If different months, show: "Jan 29 - Feb 4, 2024"
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    case 'this-month': {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      // Show: "Jan 1 - 31, 2024"
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    case 'last-month': {
      const start = startOfMonth(subMonths(currentDate, 1))
      const end = endOfMonth(subMonths(currentDate, 1))
      // Show: "Dec 1 - 31, 2023"
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    case 'this-quarter': {
      const start = startOfQuarter(currentDate)
      const end = endOfQuarter(currentDate)
      // Show: "Jan 1 - Mar 31, 2024"
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    case 'this-year': {
      const start = startOfYear(currentDate)
      const end = endOfYear(currentDate)
      // Show: "Jan 1 - Dec 31, 2024"
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    default:
      return 'For selected period'
  }
}

const PerformanceOverviewContainer: PayloadServerReactComponent<CustomComponent> = async ({
  payload,
  searchParams,
}) => {
  const performanceOverview = await payload.findGlobal({
    slug: 'performance-overview',
  })

  const duration = (searchParams?.duration as string) || 'this-month'
  const activeDuration = duration.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  const overview = performanceOverview[activeDuration as keyof PerformanceOverview]
  const dateRange = getDateRangeForDuration(duration)

  if (typeof overview !== 'object' || !overview) {
    return null
  }
  const deliveryChannel = overview?.revenue?.channels?.find(
    (channel) => channel?.channel === 'Delivery',
  )

  const totalRemaining = deliveryChannel?.areas?.reduce((sum, area) => sum + (area.remaining || 0), 0) ?? 0

  return (
    <div className="@container/main">
      <div className="flex items-center justify-between gap-2 mb-4 mt-4">
        <h2>Performance Overview</h2>
        <Filters />
      </div>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        <OverviewCard
          title="Total Revenue Collected"
          value={rupee.format(overview?.revenue?.total ?? 0)}
          description="Includes delivery, counter, fillers, and bottles sold."
          secondaryDescription={dateRange}
        />
        <OverviewCard
          title="Total Expenses"
          value={rupee.format(overview?.expenses?.total ?? 0)}
          description="Includes all expenses."
          secondaryDescription={dateRange}
        />
        <OverviewCard
          title="Total Profit"
          value={rupee.format(overview?.profit ?? 0)}
          description="Includes total revenue minus total expenses."
          secondaryDescription={dateRange}
        />
        <OverviewCard
          title="Total Bottles Delivered"
          value={(overview?.bottlesDelivered?.total ?? 0) + ''}
          description={`Estimated revenue: ${rupee.format(overview?.bottlesDelivered?.expectedRevenue ?? 0 * 2.47)} (≈ ${rupee.format(overview?.bottlesDelivered?.averageRevenue ?? 0)} per bottle)`}
          secondaryDescription={dateRange}
        />
        <OverviewCard
          title="Total Remaining"
          value={rupee.format(totalRemaining)}
          description="Outstanding amounts"
          secondaryDescription={'Calculated from active customers invoices only'}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4 @xl/main:grid-cols-1 @5xl/main:grid-cols-2">
        {overview?.revenue?.channels?.length ? (
          <BarChartHorizontal
            title="Revenue by Channels"
            description={dateRange}
            secondaryDescription="Most Revenue Collected in: Counter Sell"
            data={overview?.revenue?.channels?.map((channel) => ({
              label: channel?.channel ?? '',
              total: channel?.total ?? 0,
            }))}
          />
        ) : null}
        {overview?.expenses?.types?.length ? (
          <BarChartHorizontal
            title="Expenses by Types"
            description={dateRange}
            secondaryDescription="Most Expenses in: Daily Miscellaneous"
            data={overview?.expenses?.types?.map((type) => ({
              label: type?.type ?? '',
              total: type?.total ?? 0,
            }))}
          />
        ) : null}
      </div>

      {/* Enhanced Delivery Revenue Breakdown */}
      {(() => {
        const deliveryChannel = overview?.revenue?.channels?.find(
          (channel) => channel?.channel === 'Delivery',
        )
        if (!deliveryChannel) return null

        return (
          <div className="space-y-6 mt-6">
            {/* Payment Method Breakdown */}
            {deliveryChannel.paymentMethods && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Revenue - Payment Methods</h3>
                <PaymentMethodBreakdown
                  cash={deliveryChannel.paymentMethods.cash || 0}
                  online={deliveryChannel.paymentMethods.online || 0}
                  total={deliveryChannel.total || 0}
                  secondaryDescription={dateRange}
                />
              </div>
            )}

            {/* Geographic Collection Breakdown */}
            {deliveryChannel.areas && deliveryChannel.areas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Delivery Revenue - Collection by Area & Block
                </h3>
                <GeographicCollection
                  areas={deliveryChannel.areas as any}
                  secondaryDescription={dateRange}
                />
              </div>
            )}
          </div>
        )
      })()}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-4 @5xl/main:grid-cols-4 mt-4">
        <OverviewCard
          title="Total Active Customers"
          value={(performanceOverview?.totalActiveCustomers ?? 0) + ''}
        />
        <OverviewCard
          title="Estimated Bottles Active Customer Holds"
          value={(performanceOverview?.estimatedBottlesCustomerHolds ?? 0) + ''}
        />
      </div>
    </div>
  )
}

export default PerformanceOverviewContainer
