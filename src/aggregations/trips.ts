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
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const match: Record<string, any> = {
    area: { $in: areaIds },
    status: 'active',
  };

  if (blockIds.length) {
    match.block = { $in: blockIds };
  }

  const customers = await payload.db.collections['customers'].aggregate([
    {
      $match: match,
    },
    // Get latest delivery transaction
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
        as: 'latestDelivery',
      }
    },
    // Get recent transaction history (last 30 days)
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
                  { $gte: ['$transactionAt', thirtyDaysAgo] },
                  { $gt: ['$bottleGiven', 0] }
                ]
              }
            }
          },
          { $sort: { transactionAt: -1 } },
          {
            $group: {
              _id: null,
              totalBottles: { $sum: '$bottleGiven' },
              deliveryCount: { $sum: 1 },
              avgBottlesPerDelivery: { $avg: '$bottleGiven' },
              transactions: { $push: '$$ROOT' }
            }
          }
        ],
        as: 'recentHistory',
      }
    },
    // Get unpaid transactions count
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
                  { $eq: ['$status', 'unpaid'] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              unpaidCount: { $sum: 1 },
              unpaidAmount: { $sum: '$total' }
            }
          }
        ],
        as: 'unpaidStats',
      }
    },
    {
      $unwind: {
        path: '$latestDelivery',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$recentHistory',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$unpaidStats',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        id: { $toString: '$_id' },
        
        // Days since last delivery
        daysSinceLastDelivery: {
          $cond: {
            if: { $gt: ['$latestDelivery.transactionAt', null] },
            then: {
              $floor: {
                $divide: [
                  { $subtract: [now, '$latestDelivery.transactionAt'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            else: 999, // High number for customers with no deliveries
          },
        },
        
        // Estimated bottles remaining at customer location
        estimatedBottlesRemaining: {
          $cond: {
            if: { $gt: ['$latestDelivery.remainingBottles', null] },
            then: '$latestDelivery.remainingBottles',
            else: { $ifNull: ['$bottlesAtHome', 0] }
          }
        },
        
        // Recent consumption pattern
        avgBottlesPerDelivery: {
          $ifNull: ['$recentHistory.avgBottlesPerDelivery', 2] // Default to 2 if no history
        },
        
        deliveryFrequency: {
          $cond: {
            if: { $gt: ['$recentHistory.deliveryCount', 1] },
            then: {
              $divide: [
                30, // 30 days
                '$recentHistory.deliveryCount'
              ]
            },
            else: { $ifNull: ['$deliveryFrequencyDays', 7] } // Default frequency
          }
        },
        
        // Payment reliability score (0-100)
        paymentReliabilityScore: {
          $cond: {
            if: { $gt: ['$unpaidStats.unpaidCount', 0] },
            then: {
              $max: [0, {
                $subtract: [100, { $multiply: ['$unpaidStats.unpaidCount', 10] }]
              }]
            },
            else: 100
          }
        },
        
        unpaidCount: { $ifNull: ['$unpaidStats.unpaidCount', 0] },
        unpaidAmount: { $ifNull: ['$unpaidStats.unpaidAmount', 0] },
      },
    },
    {
      $addFields: {
        // Priority scoring system (0-100, higher = more priority)
        priorityScore: {
          $add: [
            // Days overdue factor (0-40 points)
            {
              $min: [40, {
                $max: [0, {
                  $multiply: [
                    {
                      $max: [0, {
                        $subtract: ['$daysSinceLastDelivery', '$deliveryFrequency']
                      }]
                    },
                    2 // 2 points per day overdue
                  ]
                }]
              }]
            },
            
            // Low bottles remaining factor (0-25 points)
            {
              $cond: {
                if: { $lte: ['$estimatedBottlesRemaining', 0] },
                then: 25,
                else: {
                  $cond: {
                    if: { $lte: ['$estimatedBottlesRemaining', 1] },
                    then: 15,
                    else: {
                      $cond: {
                        if: { $lte: ['$estimatedBottlesRemaining', 2] },
                        then: 10,
                        else: 0
                      }
                    }
                  }
                }
              }
            },
            
            // New customer factor (0-20 points)
            {
              $cond: {
                if: { $eq: ['$daysSinceLastDelivery', 999] },
                then: 20,
                else: 0
              }
            },
            
            // Payment reliability factor (0-15 points)
            {
              $divide: ['$paymentReliabilityScore', 7] // Scale 100 to ~15
            }
          ]
        },
        
        // Delivery recommendation categories
        recommendationCategory: {
          $cond: {
            if: { $eq: ['$daysSinceLastDelivery', 999] },
            then: 'new_customer',
            else: {
              $cond: {
                if: { $lte: ['$estimatedBottlesRemaining', 0] },
                then: 'urgent_empty',
                else: {
                  $cond: {
                    if: { $gte: ['$daysSinceLastDelivery', { $multiply: ['$deliveryFrequency', 1.5] }] },
                    then: 'overdue',
                    else: {
                      $cond: {
                        if: { $gte: ['$daysSinceLastDelivery', '$deliveryFrequency'] },
                        then: 'due',
                        else: 'not_due'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        
        // Should include in trip
        shouldIncludeInTrip: {
          $or: [
            { $eq: ['$daysSinceLastDelivery', 999] }, // New customers
            { $lte: ['$estimatedBottlesRemaining', 1] }, // Low/empty bottles
            { $gte: ['$daysSinceLastDelivery', '$deliveryFrequency'] }, // Due for delivery
            { $and: [ // High-value customers slightly before due date
              { $gte: ['$avgBottlesPerDelivery', 3] },
              { $gte: ['$daysSinceLastDelivery', { $multiply: ['$deliveryFrequency', 0.8] }] }
            ]}
          ]
        }
      },
    },
    {
      $match: {
        shouldIncludeInTrip: true,
      }
    },
    {
      $sort: {
        priorityScore: -1, // Highest priority first
        recommendationCategory: 1,
        daysSinceLastDelivery: -1
      }
    },
    {
      $project: {
        id: 1,
        name: 1,
        address: 1,
        area: 1,
        block: 1,
        rate: 1,
        balance: 1,
        bottlesAtHome: 1,
        deliveryFrequencyDays: 1,
        contactNumbers: 1,
        
        // Recommendation data
        daysSinceLastDelivery: 1,
        estimatedBottlesRemaining: 1,
        avgBottlesPerDelivery: 1,
        deliveryFrequency: 1,
        priorityScore: 1,
        recommendationCategory: 1,
        paymentReliabilityScore: 1,
        unpaidCount: 1,
        unpaidAmount: 1,
        
        // Latest delivery info
        latestDelivery: {
          transactionAt: '$latestDelivery.transactionAt',
          bottleGiven: '$latestDelivery.bottleGiven',
          remainingBottles: '$latestDelivery.remainingBottles'
        }
      }
    }
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

/**
 * Enhanced helper function to get trip customers with filtering and analytics
 */
export const getTripCustomersWithAnalytics = async (
  trip: Trip, 
  payload: BasePayload,
  options: {
    includeCategory?: string[]; // Filter by recommendation categories
    minPriorityScore?: number; // Minimum priority score
    maxCustomers?: number; // Limit number of customers
    includePaymentIssues?: boolean; // Include customers with payment issues
  } = {}
) => {
  const customers = await generateTripCustomers(trip, payload);
  
  let filteredCustomers = customers;
  
  // Filter by recommendation category
  if (options.includeCategory && options.includeCategory.length > 0) {
    filteredCustomers = filteredCustomers.filter((customer: any) => 
      options.includeCategory!.includes(customer.recommendationCategory)
    );
  }
  
  // Filter by minimum priority score
  if (options.minPriorityScore !== undefined) {
    filteredCustomers = filteredCustomers.filter((customer: any) => 
      customer.priorityScore >= options.minPriorityScore!
    );
  }
  
  // Filter out customers with payment issues if specified
  if (options.includePaymentIssues === false) {
    filteredCustomers = filteredCustomers.filter((customer: any) => 
      customer.unpaidCount <= 2 // Allow up to 2 unpaid transactions
    );
  }
  
  // Limit number of customers
  if (options.maxCustomers) {
    filteredCustomers = filteredCustomers.slice(0, options.maxCustomers);
  }
  
  // Generate analytics
  const analytics = {
    totalCustomers: customers.length,
    filteredCustomers: filteredCustomers.length,
    categories: {
      new_customer: customers.filter((c: any) => c.recommendationCategory === 'new_customer').length,
      urgent_empty: customers.filter((c: any) => c.recommendationCategory === 'urgent_empty').length,
      overdue: customers.filter((c: any) => c.recommendationCategory === 'overdue').length,
      due: customers.filter((c: any) => c.recommendationCategory === 'due').length,
      not_due: customers.filter((c: any) => c.recommendationCategory === 'not_due').length,
    },
    priorityDistribution: {
      high: customers.filter((c: any) => c.priorityScore >= 70).length,
      medium: customers.filter((c: any) => c.priorityScore >= 40 && c.priorityScore < 70).length,
      low: customers.filter((c: any) => c.priorityScore < 40).length,
    },
    paymentIssues: {
      withUnpaidTransactions: customers.filter((c: any) => c.unpaidCount > 0).length,
      totalUnpaidAmount: customers.reduce((sum: number, c: any) => sum + (c.unpaidAmount || 0), 0),
    },
    estimatedDelivery: {
      totalBottlesNeeded: filteredCustomers.reduce((sum: number, c: any) => sum + Math.ceil(c.avgBottlesPerDelivery), 0),
      highVolumeCustomers: filteredCustomers.filter((c: any) => c.avgBottlesPerDelivery >= 4).length,
    }
  };
  
  return {
    customers: filteredCustomers,
    analytics
  };
};

/**
 * Get customers who might need urgent attention (emergency deliveries)
 */
export const getUrgentDeliveryCustomers = async (trip: Trip, payload: BasePayload) => {
  return getTripCustomersWithAnalytics(trip, payload, {
    includeCategory: ['urgent_empty', 'overdue'],
    minPriorityScore: 60
  });
};

/**
 * Get new customers for onboarding trips
 */
export const getNewCustomers = async (trip: Trip, payload: BasePayload) => {
  return getTripCustomersWithAnalytics(trip, payload, {
    includeCategory: ['new_customer']
  });
};

/**
 * Get reliable customers (good payment history) for regular deliveries
 */
export const getReliableCustomers = async (trip: Trip, payload: BasePayload) => {
  return getTripCustomersWithAnalytics(trip, payload, {
    includePaymentIssues: false,
    minPriorityScore: 30
  });
};
