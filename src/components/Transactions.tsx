import { DefaultServerCellComponentProps } from 'payload'

export const DailyConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  if (!rowData?.analytics) return '<No Daily Consumption>'
  const formatted = rowData.analytics.consumptionRate.toFixed(2)
  return <span>{formatted} bottles/day</span>
}

export const AdjustedConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  if (!rowData?.analytics) return '<No Adjusted Consumption>'
  const formatted = rowData.analytics.adjustedConsumptionRate.toFixed(2)
  return <span>{formatted} bottles/day</span>
}

export const WeeklyConsumptionCell = ({ rowData }: DefaultServerCellComponentProps) => {
  if (!rowData?.analytics) return '<No Weekly Consumption>'
  return <span>{rowData.analytics.weeklyConsumption} bottles/week</span>
}

export const DaysUntilDeliveryCell = ({ rowData }: DefaultServerCellComponentProps) => {
  if (!rowData?.analytics) return '<No Days Until Delivery>'
  const days = Math.ceil(rowData.analytics.daysUntilDelivery)

  if (days <= 0) return <span>Today</span>
  if (days === 1) return <span>Tomorrow</span>

  return <span>{days} days</span>
}
