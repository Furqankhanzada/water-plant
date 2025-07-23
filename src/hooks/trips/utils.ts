import type { BasePayload } from 'payload';
import { Types } from 'mongoose';
import { Trip } from '@/payload-types';

export const generateTripCustomers = async (trip: Trip, payload: BasePayload) => {

  const areaIds = trip.areas.map(a =>
    typeof a === 'string' ? new Types.ObjectId(a) : new Types.ObjectId(a.id)
  );

  const blockIds = (trip.blocks || []).map(b =>
    typeof b === 'string' ? new Types.ObjectId(b) : new Types.ObjectId(b.id)
  );

  const deliveryFrequencyDays = 4;
  const now = new Date();

  const match: Record<string, any> = {
    area: { $in: areaIds },
    status: 'active', // Assuming you want only active customers
  };

  if (blockIds.length) {
    match.block = { $in: blockIds };
  }

  const customers = await payload.db.collections['customers'].aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'transactions',
        let: { customerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$customer', '$$customerId'] },
                  {
                    $or: [
                      { $gt: ['$bottleGiven', 0] },
                      { $gt: ['$bottleTaken', 0] }
                    ]
                  }
                ]
              }
            }
          },
          { $sort: { transactionAt: -1 } },
          { $limit: 1 }
        ],
        as: 'latestTransaction',
      }
    },
    {
      $unwind: {
        path: '$latestTransaction',
        preserveNullAndEmptyArrays: true, // keep customers with no transactions
      },
    },
    {
      $addFields: {
        lastDeliveredDaysAgo: {
          $cond: {
            if: { $gt: ['$latestTransaction.transactionAt', null] },
            then: {
              $floor: {
                $divide: [
                  { $subtract: [now, '$latestTransaction.transactionAt'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            else: null,
          },
        },
        needsDelivery: {
          $cond: {
            if: {
              $or: [
                { $not: ['$latestTransaction.transactionAt'] },
                {
                  $gt: [
                    {
                      $divide: [
                        { $subtract: [now, '$latestTransaction.transactionAt'] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                    {
                      $ifNull: ['$deliveryFrequencyDays', deliveryFrequencyDays] // 👈 fallback to default
                    }
                  ],
                },
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $match: {
        needsDelivery: true,
      }
    },
  ]);

  console.log(`Customers needing delivery: ${customers.length}`, customers);
  return customers;

}

export const insertCustomersTransactions = async (tripCustomers: any[], tripResult: Trip, payload: BasePayload) => {
  const transactions = tripCustomers.map((customer) => ({
    trip: tripResult.id,
    customer: customer._id,
    status: 'unpaid',
    bottleGiven: 0,
    bottleTaken: 0,
    total: 0,
    transactionAt: new Date(tripResult.tripAt).toISOString(),
  }));

  await payload.db.collections['transaction'].insertMany(transactions);
}