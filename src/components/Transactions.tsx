import { DefaultServerCellComponentProps } from 'payload'

export const DailyConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  const { analytics } = rowData
  if (!analytics?.consumptionRate) return '<No Daily Consumption>'
  const formatted = analytics.consumptionRate.toFixed(2)
  return <span>{formatted} bottles/day</span>
}

export const AdjustedConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  const { analytics } = rowData
  if (!analytics?.adjustedConsumptionRate) return '<No Adjusted Consumption>'
  const formatted = analytics.adjustedConsumptionRate.toFixed(2)
  return <span>{formatted} bottles/day</span>
}

export const WeeklyConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  const { analytics } = rowData
  if (!analytics?.weeklyConsumption) return '<No Weekly Consumption>'
  return <span>{analytics.weeklyConsumption} bottles/week</span>
}

export const DaysUntilDeliveryCell = ({ rowData }: DefaultServerCellComponentProps) => {
  const { analytics } = rowData
  if (analytics?.daysUntilDelivery == null) return '<No Days Until Delivery>'
  const days = Math.ceil(analytics.daysUntilDelivery)

  if (days <= 0) return <span>Today</span>
  if (days === 1) return <span>Tomorrow</span>

  return <span>{days} days</span>
}
