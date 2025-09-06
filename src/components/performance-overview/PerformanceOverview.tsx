import React from 'react'
import { CustomComponent, PayloadServerReactComponent } from 'payload'
import { PerformanceOverview } from '@/payload-types'
import { rupee } from '@/collections/Reports'

import { Filters } from './Filters'
import { OverviewCard } from './OverviewCard'
import { BarChartHorizontal } from './BarChartHorizontal'

const PerformanceOverviewContainer: PayloadServerReactComponent<CustomComponent> = async ({
  payload,
  searchParams,
}) => {
  const performanceOverview = await payload.findGlobal({
    slug: 'performance-overview',
  })

  const activeDuration = ((searchParams?.duration as string) || 'this-month').replace(
    /-([a-z])/g,
    (_, letter) => letter.toUpperCase(),
  )
  const overview = performanceOverview[activeDuration as keyof PerformanceOverview]

  if (typeof overview !== 'object' || !overview) {
    return null
  }

  console.log('activeDuration', activeDuration)
  console.log('overview', overview)

  return (
    <div className="@container/main">
      <div className="flex items-center justify-between gap-2 mb-4 mt-4">
        <h2>Performance Overview</h2>
        <Filters />
      </div>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <OverviewCard
          title="Total Revenue Collected"
          value={rupee.format(overview?.revenue?.total ?? 0)}
          description="Includes delivery, counter, fillers, and bottles sold."
          secondaryDescription="For selected period"
        />
        <OverviewCard
          title="Total Expenses"
          value={rupee.format(overview?.expenses?.total ?? 0)}
          description="Includes all expenses."
          secondaryDescription="For selected period"
        />
        <OverviewCard
          title="Total Profit"
          value={rupee.format(overview?.profit ?? 0)}
          description="Includes total revenue minus total expenses."
          secondaryDescription="For selected period"
        />
        <OverviewCard
          title="Total Bottles Delivered"
          value={(overview?.bottlesDelivered?.total ?? 0) + ''}
          description={`Estimated revenue: ${rupee.format(overview?.bottlesDelivered?.expectedRevenue ?? 0 * 2.47)} (≈ ${rupee.format(overview?.bottlesDelivered?.averageRevenue ?? 0)} per bottle)`}
          secondaryDescription="For selected period"
        />
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="col-span-2">
          {overview?.revenue?.channels?.length ? (
            <BarChartHorizontal
              title="Revenue by Channels"
              description="For selected period"
              secondaryDescription="Most Revenue Collected in: Counter Sell"
              data={overview?.revenue?.channels?.map((channel) => ({
                label: channel?.channel ?? '',
                total: channel?.total ?? 0,
              }))}
            />
          ) : null}
        </div>
        <div className="col-span-2">
          {overview?.expenses?.types?.length ? (
            <BarChartHorizontal
              title="Expenses by Types"
              description="For selected period"
              secondaryDescription="Most Expenses in: Daily Miscellaneous"
              data={overview?.expenses?.types?.map((type) => ({
                label: type?.type ?? '',
                total: type?.total ?? 0, 
              }))}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default PerformanceOverviewContainer
