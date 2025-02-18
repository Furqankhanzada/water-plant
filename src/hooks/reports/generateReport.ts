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

  const invoices = await payload.db.collections['invoice'].aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$paidAmount' },
        // totalRemainingAmount: { $sum: '$remainingAmount' },
      },
    },
  ])

  const customers = await payload.db.collections['customers'].aggregate([
    {
      $lookup: {
        from: 'invoices',
        localField: '_id',
        foreignField: 'customer',
        pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
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

  console.log('expenses: ', expenses[0].totalExpense)

  data.totalIncome = invoices[0].totalIncome
  data.totalDueAmount = customers[0].totalRemainingAmount
  data.totalBottlesDelivered = transactions[0].totalBottlesDelivered
  data.totalExpectedIncome = transactions[0].totalExpectedIncome
  data.totalExpenses = expenses[0].totalExpense

  return data
}
