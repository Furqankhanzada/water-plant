'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function fetchMetrics() {
  const payload = await getPayload({ config });

  try {
    const customers = await payload.count({
      collection: 'customers',
    });

    const result = await payload.db.collections['invoice'].aggregate([
      {
        $sort: {
          customer: 1,
          createdAt: -1, // So latest invoice per customer is first
        },
      },
      {
        $group: {
          _id: '$customer',
          latestRemainingAmount: { $first: '$remainingAmount' }, // Only latest
        },
      },
      {
        $group: {
          _id: null,
          totalRemainingAmount: { $sum: '$latestRemainingAmount' },
        },
      },
    ]);

    const transactions = await payload.db.collections['transaction'].aggregate([
      {
        $match: {
          transactionAt: { $gte: 'from', $lte: 'to' },
        },
      },
      {
        $group: {
          _id: null,
          totalBottlesDelivered: { $sum: '$bottleGiven' },
          totalExpectedIncome: { $sum: '$total' },
        },
      },
    ]);

    const totalBottlesDelivered = transactions[0].totalBottlesDelivered
    const totalExpectedIncome = transactions[0].totalExpectedIncome

    const invoices = await payload.db.collections['invoice'].aggregate([
      {
        $match: {
          createdAt: { $gte: 'from', $lte: 'to' },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$paidAmount' },
          // totalRemainingAmount: { $sum: '$remainingAmount' },
        },
      },
    ]);

    const totalIncome = invoices[0].totalIncome;



    return { customers, result, totalBottlesDelivered, totalExpectedIncome, totalIncome };
  } catch (error: any) {
    throw new Error(`Error creating post: ${error?.message}`)
  }
}