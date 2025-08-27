import { BasePayload } from 'payload'
import { addDays, differenceInDays, startOfDay, subDays } from 'date-fns'
import { Transaction } from '@/payload-types'

/**
 * CustomerDeliveryGenerator is responsible for predicting when each customer will run out of water bottles
 * based on their recent consumption behavior, seasonal adjustments, and customer usage types.
 *
 * The system:
 * - Fetches recent transactions for each customer.
 * - Calculates base and adjusted daily consumption rates.
 * - Estimates the number of days until a new delivery is needed.
 * - Assigns delivery priority (URGENT, HIGH, MEDIUM, LOW).
 * - Returns a sorted list of customers based on urgency.
 *
 * It is optimized for use in a water delivery business context (e.g., Karachi, Pakistan), where
 * water usage varies seasonally and by customer type (households, offices, etc.).
 */

export interface CustomerDeliveryAnalytics {
  customer: string
  consumptionRate: number
  adjustedConsumptionRate: number
  weeklyConsumption: number
  daysUntilDelivery: number
  nextDeliveryDate: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

const BUFFER_BOTTLES = 0 // 🚀 A fixed number of bottles we always want to keep aside as a safety net (e.g. 1 bottles).

export class CustomerDeliveryGenerator {
  private getSeasonalMultiplier(month: number): number {
    // Karachi, Pakistan seasonal patterns based on temperature and consumption data
    // Higher temperatures = higher water consumption
    const seasonalFactors: Record<number, number> = {
      0: 0.75, // January - Cool winter (avg 19°C/66°F)
      1: 0.8, // February - Mild winter (avg 21°C/70°F)
      2: 0.95, // March - Pleasant spring (avg 26°C/79°F)
      3: 1.15, // April - Warm spring (avg 30°C/86°F)
      4: 1.35, // May - Hot pre-summer (avg 33°C/91°F)
      5: 1.45, // June - Peak summer heat (avg 34°C/93°F)
      6: 1.5, // July - Hottest month (avg 31°C/88°F + humidity)
      7: 1.25, // August - Hot summer (avg 30°C/86°F + monsoon)
      8: 1.2, // September - Post-monsoon heat (avg 31°C/88°F)
      9: 1.15, // October - Warm autumn (avg 32°C/90°F)
      10: 1.0, // November - Pleasant (avg 28°C/82°F)
      11: 0.85, // December - Cool (avg 23°C/73°F)
    }
    return seasonalFactors[month] || 1.0
  }

  private getWaterConsumptionAdjustmentFactor(dailyAvgBottles: number): number {
    // Returns a multiplier to adjust predictions based on daily average bottle consumption

    if (dailyAvgBottles >= 2.0) return 1.1 // High-consumption customers (families, offices) -- add 10% buffer
    if (dailyAvgBottles >= 1.0) return 1.0 // Average consumers -- add no buffer
    if (dailyAvgBottles >= 0.5) return 0.9 // Low-consumption households -- reduce by 10%
    return 0.8 // Very low usage (e.g., seasonal or occasional use) -- reduce by 20%
  }

  private calculateRemainingBottles(latest: Transaction): number {
    const remainingBottles = latest.remainingBottles ?? 0
    const bottleGiven = latest.bottleGiven ?? 0

    return Math.max(remainingBottles, bottleGiven)
  }

  private getPriority(daysUntilDelivery: number): CustomerDeliveryAnalytics['priority'] {
    if (daysUntilDelivery <= 1) return 'URGENT'
    if (daysUntilDelivery <= 2) return 'HIGH'
    if (daysUntilDelivery <= 3) return 'MEDIUM'
    return 'LOW'
  }

  private calculateDaysDiff(startDate: Date, endDate: Date): number {
    const millisecondsInADay = 1000 * 60 * 60 * 24
    const timeDiffInMs = endDate.getTime() - startDate.getTime()
    const days = Math.ceil(timeDiffInMs / millisecondsInADay)

    return Math.max(1, days)
  }

  private calculateTotalBottlesConsumed(transactions: Transaction[]): number {
    return transactions.reduce((sum, txn) => sum + (txn.bottleTaken || 0), 0)
  }

  private calculateCoverageDays(remaining: number, rate: number, buffer = BUFFER_BOTTLES): number {
    const net = remaining - buffer
    return Math.max(0, net / Math.max(0.1, rate))
  }

  async fetchAnalyticsByCustomerId(
    customer: Transaction['customer'],
    payload: BasePayload,
  ): Promise<Partial<CustomerDeliveryAnalytics>> {
    if (typeof customer === 'string') {
      customer = await payload.findByID({
        collection: 'customers',
        id: customer,
        depth: 0,
      })
    }

    const today = startOfDay(new Date())
    const thirtyDaysAgo = subDays(today, 30)

    const { docs: txns } = await payload.find({
      collection: 'transaction',
      where: {
        and: [
          { customer: { equals: customer.id } },
          { transactionAt: { greater_than_equal: thirtyDaysAgo } },
          {
            or: [{ bottleGiven: { greater_than: 0 } }, { bottleTaken: { greater_than: 0 } }],
          },
        ],
      },
      sort: '-transactionAt',
      depth: 0,
      limit: 30,
    })

    if (txns.length === 0) {
      console.warn(`No recent transactions for customer ${customer.name}`)
      // must be empty object and not null or undefined
      return {}
    }

    const latest = txns[0]
    const oldestDate = new Date(txns[txns.length - 1].transactionAt)
    const daysDiff = this.calculateDaysDiff(oldestDate, today)

    const totalBottlesConsumed = this.calculateTotalBottlesConsumed(txns)
    const baseRate = totalBottlesConsumed / daysDiff
    const adjustedRate =
      baseRate *
      this.getSeasonalMultiplier(today.getMonth()) *
      this.getWaterConsumptionAdjustmentFactor(baseRate)

    const remaining = this.calculateRemainingBottles(latest)

    // convert “coverage from last delivery” into “days from now”
    const lastDeliveredAt = startOfDay(latest.transactionAt)
    const daysSinceLastDelivery = differenceInDays(today, lastDeliveredAt)

    // how many days the remaining bottles would have lasted
    const coverageFromLastDelivery = this.calculateCoverageDays(remaining, baseRate)

    // now: subtract what’s already elapsed to get “days left from now”
    const daysUntilDelivery = Math.max(0, coverageFromLastDelivery - daysSinceLastDelivery)

    // nextDeliveryDate: today if overdue, else ceil to whole days ahead
    const nextDeliveryDate = addDays(today, Math.ceil(daysUntilDelivery))

    const priority = this.getPriority(daysUntilDelivery)

    return {
      customer: customer.id,
      consumptionRate: baseRate,
      adjustedConsumptionRate: adjustedRate,
      weeklyConsumption: Math.ceil(baseRate * 7),
      daysUntilDelivery: daysUntilDelivery,
      nextDeliveryDate: nextDeliveryDate.toISOString(),
      priority,
    }
  }

  async fetchAnalyticsWithAggregation(
    match: any,
    payload: BasePayload,
  ): Promise<CustomerDeliveryAnalytics[]> {
    const db = payload.db
    const today = startOfDay(new Date())
    const thirtyDaysAgo = subDays(today, 30)

    const seasonalMultiplier = this.getSeasonalMultiplier(today.getMonth())

    const usageAdjustment = {
      high: 1.1,
      average: 1.0,
      low: 0.9,
      veryLow: 0.8,
    }

    // Constants for easy adjustment
    const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

    const matchCustomers = { $match: match }

    // Join last 30 days of transactions for each customer
    const joinTransactions = {
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
                  {
                    $or: [{ $gt: ['$bottleGiven', 0] }, { $gt: ['$bottleTaken', 0] }],
                  },
                ],
              },
            },
          },
          { $sort: { transactionAt: -1 as const } },
          { $limit: 30 },
        ],
        as: 'transactions',
      },
    }

    // Filter out customers without any transactions
    const filterCustomersWithTransactions = {
      $match: {
        'transactions.0': { $exists: true },
      },
    }

    // Pick latest and oldest transaction from the sorted list
    const extractTransactionInfo = {
      $addFields: {
        latestTransaction: { $arrayElemAt: ['$transactions', 0] },
        oldestTransaction: { $arrayElemAt: ['$transactions', -1] },
      },
    }

    // Calculate total bottles taken and time range in days
    const computeConsumptionMetrics = {
      $addFields: {
        totalBottlesTaken: {
          $sum: {
            $map: {
              input: '$transactions',
              as: 'txn',
              in: { $ifNull: ['$$txn.bottleTaken', 0] },
            },
          },
        },
        daysDiff: {
          $max: [
            1,
            {
              $ceil: {
                $divide: [
                  { $subtract: [today, '$oldestTransaction.transactionAt'] },
                  MILLISECONDS_PER_DAY,
                ],
              },
            },
          ],
        },
      },
    }

    // Base rate = total taken / number of days
    const calculateBaseRate = {
      $addFields: {
        baseRate: {
          $divide: ['$totalBottlesTaken', '$daysDiff'],
        },
      },
    }

    // Apply seasonal and customer-type adjustment factors
    const applyAdjustments = {
      $addFields: {
        usageFactor: {
          $switch: {
            branches: [
              { case: { $gte: ['$baseRate', 2.0] }, then: usageAdjustment.high },
              { case: { $gte: ['$baseRate', 1.0] }, then: usageAdjustment.average },
              { case: { $gte: ['$baseRate', 0.5] }, then: usageAdjustment.low },
            ],
            default: usageAdjustment.veryLow,
          },
        },
        adjustedRate: {
          $multiply: ['$baseRate', seasonalMultiplier],
        },
      },
    }

    // Compute final adjusted consumption rate + bottle counts
    const computeAdjustedRateAndBottles = {
      $addFields: {
        adjustedConsumptionRate: {
          $multiply: ['$adjustedRate', '$usageFactor'],
        },
        remainingBottles: { $ifNull: ['$latestTransaction.remainingBottles', 0] },
        bottleGiven: { $ifNull: ['$latestTransaction.bottleGiven', 0] },
      },
    }

    // Determine best estimate of remaining bottles
    const calculateRemainingBottles = {
      $addFields: {
        remaining: {
          $cond: [
            { $lt: ['$remainingBottles', '$bottleGiven'] },
            '$bottleGiven',
            '$remainingBottles',
          ],
        },
      },
    }

    // Compute days since last delivery
    const computeDaysSinceLastDelivery = {
      $addFields: {
        daysSinceLastDelivery: {
          $max: [
            0,
            {
              $ceil: {
                $divide: [
                  { $subtract: [today, '$latestTransaction.transactionAt'] },
                  MILLISECONDS_PER_DAY,
                ],
              },
            },
          ],
        },
      },
    }

    // Compute coverage from last delivery (with buffer bottles)
    const computeCoverageFromLastDelivery = {
      $addFields: {
        coverageFromLastDelivery: {
          $max: [
            0,
            {
              $divide: [
                {
                  $max: [0, { $subtract: [{ $ifNull: ['$remaining', 0] }, BUFFER_BOTTLES] }],
                },
                { $max: [{ $ifNull: ['$baseRate', 0.1] }, 0.1] },
              ],
            },
          ],
        },
      },
    }

    // Final daysUntilDelivery = coverage - daysSinceLastDelivery
    const computeDaysUntilDelivery = {
      $addFields: {
        daysUntilDelivery: {
          $max: [0, { $subtract: ['$coverageFromLastDelivery', '$daysSinceLastDelivery'] }],
        },
      },
    }

    // Final calculations: days until delivery, priority, next delivery date
    const computeDeliveryAnalytics = {
      $addFields: {
        weeklyConsumption: {
          $ceil: { $multiply: ['$baseRate', 7] },
        },
        nextDeliveryDate: {
          $dateToString: {
            format: '%Y-%m-%dT%H:%M:%SZ',
            date: {
              $add: [today, { $multiply: ['$daysUntilDelivery', MILLISECONDS_PER_DAY] }],
            },
          },
        },
        priority: {
          $switch: {
            branches: [
              { case: { $lte: ['$daysUntilDelivery', 1] }, then: 'URGENT' },
              { case: { $lte: ['$daysUntilDelivery', 2] }, then: 'HIGH' },
              { case: { $lte: ['$daysUntilDelivery', 3] }, then: 'MEDIUM' },
            ],
            default: 'LOW',
          },
        },
      },
    }

    // Output desired fields
    const finalProjection = {
      $project: {
        _id: 0,
        customer: { $toString: '$_id' },
        consumptionRate: '$baseRate',
        adjustedConsumptionRate: 1,
        weeklyConsumption: 1,
        daysUntilDelivery: 1,
        nextDeliveryDate: 1,
        priority: 1,
      },
    }

    const customers = await db.collections['customers'].aggregate([
      matchCustomers,
      joinTransactions,
      filterCustomersWithTransactions,
      extractTransactionInfo,
      computeConsumptionMetrics,
      calculateBaseRate,
      applyAdjustments,
      computeAdjustedRateAndBottles,
      calculateRemainingBottles,
      computeDaysSinceLastDelivery,
      computeCoverageFromLastDelivery,
      computeDaysUntilDelivery,
      computeDeliveryAnalytics,
      finalProjection,
    ])

    return customers
  }
}

export const customerDeliveryGenerator = new CustomerDeliveryGenerator()
