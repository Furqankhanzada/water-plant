import type { BasePayload } from 'payload';
import { Types } from 'mongoose';
import { Trip, Transaction } from '@/payload-types';

export const generateTripCustomers = async (trip: Trip, payload: BasePayload) => {

  const areaIds = trip.areas.map(a =>
    typeof a === 'string' ? new Types.ObjectId(a) : new Types.ObjectId(a.id)
  );

  const blockIds = (trip.blocks || []).map(b =>
    typeof b === 'string' ? new Types.ObjectId(b) : new Types.ObjectId(b.id)
  );

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
                  { $gt: ['$bottleGiven', 0] }
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
        id: { $toString: '$_id' },
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
                    '$deliveryFrequencyDays'
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

  return customers;

}

export const generateTripReport = async (tripId: string, payload: BasePayload) => {
  // 1. Fetch trip
  const trip = await payload.findByID({
    collection: 'trips',
    id: tripId,
    select: {
      areas: true,
      tripAt: true,
      blocks: true,
      bottles: true,
      status: true,
    },
    depth: 1,
  });

  // 2. Fetch relevant blocks
  const areaIds = trip.areas.map(a => typeof a === 'string' ? a : a.id);
  const blockIds = (trip.blocks || []).map(b => typeof b === 'string' ? b : b.id);

  const blockWhere: Record<string, { in: string[] }> = {
    area: { in: areaIds },
  };
  if (blockIds && blockIds?.length) blockWhere.id = { in: blockIds };

  const blocksPromise = payload.find({
    collection: 'blocks',
    where: blockWhere,
    select: { name: true, area: true },
    depth: 0,
    pagination: false,
  });

  // 3. Aggregation to fetch enriched transactions
  const transactionsPromise = payload.db.collections['transaction'].aggregate([
    { $match: { trip: new Types.ObjectId(tripId) } },

    // Lookup customer
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
        pipeline: [
          { $addFields: { id: { $toString: '$_id' } } },
        ]
      },
    },
    { $unwind: '$customer' },

    // Lookup customer's block (optional)
    {
      $lookup: {
        from: 'blocks',
        localField: 'customer.block',
        foreignField: '_id',
        as: 'customer.block',
        pipeline: [
          { $addFields: { id: { $toString: '$_id' } } },
        ]
      },
    },
    { $unwind: { path: '$customer.block', preserveNullAndEmptyArrays: true } },

    // Lookup latest invoice for customer
    {
      $lookup: {
        from: 'invoices',
        let: { customerId: '$customer._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$customer', '$$customerId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $addFields: { id: { $toString: '$_id' } } },
          { $project: { status: 1, advanceAmount: 1, remainingAmount: 1, dueAmount: 1, id: 1 } },
        ],
        as: 'customer.invoice.docs',
      },
    },

    // Lookup latest transaction for customer (across all trips)
    {
      $lookup: {
        from: 'transactions',
        let: { customerId: '$customer._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$customer', '$$customerId'] },
                  { $gt: ['$bottleGiven', 0] },
                ],
              },
            },
          },
          { $sort: { transactionAt: -1 } },
          { $limit: 1 },
          { $addFields: { id: { $toString: '$_id' } } },
        ],
        as: 'customer.latestTransaction',
      },
    },
    { $unwind: { path: '$customer.latestTransaction', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        id: { $toString: '$_id' },
      }
    },

    // Optional: project only required fields
    {
      $project: {
        id: 1,
        customer: 1,
        bottleGiven: 1,
        bottleTaken: 1,
        remainingBottles: 1,
      },
    },
  ]);

  const [blocks, transactions] = await Promise.all([blocksPromise, transactionsPromise]);
  const data = {
    trip,
    blocks: blocks.docs,
    transactions,
  };
  return data;
};

export const insertCustomersTransactions = async (
  tripCustomers: any[],
  tripResult: Trip,
  payload: BasePayload
): Promise<void> => {
  try {
    const transactions = tripCustomers.map((customer) => ({
      trip: tripResult.id,
      customer: customer.id,
      status: 'unpaid',
      bottleGiven: 0,
      bottleTaken: 0,
      total: 0,
      transactionAt: new Date(tripResult.tripAt).toISOString(),
    }));

    // Insert all transactions in parallel
    await Promise.all(
      transactions.map((tx) =>
        payload.create({
          collection: 'transaction',
          data: tx as Transaction,
        })
      )
    );
  } catch (error) {
    throw new Error(
      `Failed to insert customer transactions for trip ${tripResult.id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};