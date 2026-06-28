import { Payload } from 'payload'
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear,
} from 'date-fns'
import {
  calculateDeliveryRevenue,
  calculatePaymentMethodBreakdown,
  calculateGeographicCollection,
  calculateInvoiceSalesRevenue,
  calculateBottlesDeliveredByArea,
  calculateCustomersByArea,
} from './performanceAggregations'

/**
 * Compute-on-read replacement for the hook-written performance snapshot.
 * Every number is calculated live for the requested window, so it can never
 * be stale or mix values "as of" different write times.
 */

export const getDateBounds = (duration: string): { startDate: Date; endDate: Date } => {
  const now = new Date()
  switch (duration) {
    case 'today': return { startDate: startOfDay(now), endDate: endOfDay(now) }
    case 'this-week': return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'last-month': return { startDate: startOfMonth(subMonths(now, 1)), endDate: endOfMonth(subMonths(now, 1)) }
    case 'this-quarter': return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) }
    case 'this-year': return { startDate: startOfYear(now), endDate: endOfYear(now) }
    case 'all-time': return { startDate: new Date(0), endDate: endOfYear(now) }
    case 'this-month':
    default: return { startDate: startOfMonth(now), endDate: endOfMonth(now) }
  }
}

// Counter & Other sales are direct cash (totals.gross == collected)
const aggregateCounterOtherSales = async (payload: Payload, startDate: Date, endDate: Date) => {
  const rows = await payload.db.collections['sales'].aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        deletedAt: { $exists: false },
        channel: { $in: ['counter', 'other'] },
      },
    },
    { $group: { _id: '$channel', total: { $sum: '$totals.gross' } } },
  ])
  const labels: Record<string, string> = { counter: 'Counter Sales', other: 'Other' }
  return rows.map((r) => ({ channel: labels[r._id] || r._id, total: r.total }))
}

const aggregateExpenses = async (payload: Payload, startDate: Date, endDate: Date) => {
  const rows = await payload.db.collections['expenses'].aggregate([
    { $match: { expenseAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ])
  const total = rows.reduce((s, r) => s + r.total, 0)
  return { total, types: rows.map((r) => ({ type: r._id, total: r.total })) }
}

// Headline bottles delivered — counts every delivery in the window regardless of
// the customer's current status (archived customers still received those bottles).
const aggregateBottlesHeadline = async (payload: Payload, startDate: Date, endDate: Date) => {
  const rows = await payload.db.collections['transaction'].aggregate([
    { $match: { transactionAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$bottleGiven' }, expectedRevenue: { $sum: '$total' } } },
  ])
  const total = rows[0]?.total || 0
  const expectedRevenue = rows[0]?.expectedRevenue || 0
  return { total, expectedRevenue, averageRevenue: total > 0 ? expectedRevenue / total : 0 }
}

const salesChannelLabel = (channel: string): string =>
  ({ filler: 'Filler', shop: 'Bottles Sold', bottles: 'Bottles Sold' }[channel] || channel)

/** One period's worth of dashboard data, computed live. */
export const computePeriod = async (payload: Payload, startDate: Date, endDate: Date) => {
  const [delivery, paymentMethods, areas, invoiceSales, counterOther, expenses, bottlesHeadline, bottlesByArea] =
    await Promise.all([
      calculateDeliveryRevenue(payload, startDate, endDate),
      calculatePaymentMethodBreakdown(payload, startDate, endDate),
      calculateGeographicCollection(payload, startDate, endDate),
      calculateInvoiceSalesRevenue(payload, startDate, endDate),
      aggregateCounterOtherSales(payload, startDate, endDate),
      aggregateExpenses(payload, startDate, endDate),
      aggregateBottlesHeadline(payload, startDate, endDate),
      calculateBottlesDeliveredByArea(payload, startDate, endDate),
    ])

  const channels: Array<{ channel: string; total: number; paymentMethods?: any; areas?: any }> = [
    { channel: 'Delivery', total: delivery, paymentMethods, areas },
    ...invoiceSales.map((s) => ({ channel: salesChannelLabel(s.channel), total: s.total })),
    ...counterOther,
  ]
  const revenueTotal = channels.reduce((s, c) => s + (c.total || 0), 0)

  return {
    revenue: { total: revenueTotal, channels },
    expenses,
    profit: revenueTotal - expenses.total,
    bottlesDelivered: { ...bottlesHeadline, byArea: bottlesByArea },
  }
}

/** Period-independent figures shown alongside the period cards. */
export const computeGlobals = async (payload: Payload) => {
  const [customersByArea, activeCount, holdsRows] = await Promise.all([
    calculateCustomersByArea(payload),
    payload.db.collections['customers'].aggregate([
      { $match: { status: 'active', deletedAt: { $exists: false } } },
      { $count: 'n' },
    ]),
    // Latest remaining bottles per active customer, summed
    payload.db.collections['transaction'].aggregate([
      { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customerData' } },
      { $match: { 'customerData.status': 'active', 'customerData.deletedAt': { $exists: false } } },
      { $sort: { customer: 1, transactionAt: -1 } },
      { $group: { _id: '$customer', latest: { $first: '$remainingBottles' } } },
      { $group: { _id: null, total: { $sum: '$latest' } } },
    ]),
  ])
  return {
    customersByArea,
    totalActiveCustomers: activeCount[0]?.n || 0,
    estimatedBottlesCustomerHolds: holdsRows[0]?.total || 0,
  }
}
