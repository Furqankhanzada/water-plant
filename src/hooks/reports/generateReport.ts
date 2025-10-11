import { endOfMonth, startOfMonth } from 'date-fns'

import type { CollectionBeforeChangeHook } from 'payload'

export const generateReport: CollectionBeforeChangeHook = async ({ data, req: { payload } }) => {
  const from = startOfMonth(data.month)
  const to = endOfMonth(data.month)

  const expenses = await payload.db.collections['expenses'].aggregate([
    {
      $match: {
        expenseAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: '$amount' },
      },
    },
  ])

  const invoices = await payload.db.collections['payments'].aggregate([
    {
      $match: {
        paidAt: {
          $gte: from,
          $lt: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalCollection: { $sum: '$amount' },
      },
    },
  ])

  const customers = await payload.db.collections['customers'].aggregate([
    {
      $lookup: {
        from: 'invoices',
        localField: '_id',
        foreignField: 'customer',
        pipeline: [
          { $match: { createdAt: { $lte: to } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: 'invoices',
      },
    },
    { $unwind: '$invoices' },
    {
      $group: {
        _id: null,
        totalRemainingAmount: {
          $sum: '$invoices.remainingAmount',
        },
      },
    },
  ])

  const transactions = await payload.db.collections['transaction'].aggregate([
    {
      $match: {
        transactionAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        totalBottlesDelivered: { $sum: '$bottleGiven' },
        totalExpectedIncome: { $sum: '$total' },
      },
    },
  ])

  data.totalCollection = invoices[0].totalCollection
  data.totalDueAmount = customers[0].totalRemainingAmount
  data.totalBottlesDelivered = transactions[0].totalBottlesDelivered
  data.totalExpectedIncome = transactions[0].totalExpectedIncome
  data.totalExpenses = expenses[0]?.totalExpense || 0

  return data
}
