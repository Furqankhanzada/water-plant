import { BasePayload, Where } from 'payload'
import { addDays } from 'date-fns'
import { Transaction } from '@/payload-types'

/**
 * DeliveryScheduler is responsible for predicting when each customer will run out of water bottles
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

export interface DeliveryPrediction {
  customerId: string
  customerName: string
  address: string
  invalidTransaction: boolean
  bottlesAtHome: number
  consumptionRate: number
  adjustedConsumptionRate: number
  daysUntilDelivery: number
  nextDeliveryDate: Date
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export class DeliveryScheduler {
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
      7: 1.45, // August - Hot summer (avg 30°C/86°F + monsoon)
      8: 1.35, // September - Post-monsoon heat (avg 31°C/88°F)
      9: 1.2, // October - Warm autumn (avg 32°C/90°F)
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

  private calculateRemainingBottles(
    latestTransaction: Transaction,
    invalidTransaction: boolean,
  ): number {
    const { remainingBottles, bottleGiven } = latestTransaction

    const remaining = remainingBottles ?? 0

    // Case 1: Invalid transaction — prioritize bottleGiven if remaining is suspiciously low
    if (invalidTransaction) {
      return remaining < bottleGiven ? bottleGiven : remaining
    }

    // Case 2: Even if valid, still prefer bottleGiven if remaining is lower
    if (remaining < bottleGiven) {
      return bottleGiven
    }

    // Case 3: Trust remaining value
    return remaining
  }

  private getPriority(daysUntilDelivery: number): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (daysUntilDelivery <= 1) return 'URGENT'
    if (daysUntilDelivery <= 2) return 'HIGH'
    if (daysUntilDelivery <= 3) return 'MEDIUM'
    return 'LOW'
  }

  private isInvalidTransaction(latestTransaction: Transaction): boolean {
    if (
      latestTransaction.remainingBottles != null &&
      latestTransaction.remainingBottles > 0 &&
      latestTransaction.bottleTaken > latestTransaction.remainingBottles
    ) {
      return true
    }
    return false
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

  private calculateNextDeliveryDate(daysUntilDelivery: number): Date {
    return addDays(new Date(), Math.ceil(daysUntilDelivery))
  }

  private calculateDaysUntilDelivery(
    remainingBottles: number,
    adjustedConsumptionRate: number,
    safetyBuffer = 1,
  ): number {
    const netBottles = remainingBottles - safetyBuffer
    const safeRate = Math.max(0.1, adjustedConsumptionRate) // prevent divide-by-zero
    return Math.max(0, netBottles / safeRate)
  }

  async calculateDeliverySchedule(
    match: Where,
    payload: BasePayload,
  ): Promise<DeliveryPrediction[]> {
    // const customers = await payload.db.collections.customers.collection.find(match).toArray()
    const { docs: customers } = await payload.find({
      collection: 'customers',
      where: match,
      limit: 1000,
    })

    const predictions: DeliveryPrediction[] = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const seasonalMultiplier = this.getSeasonalMultiplier(currentMonth)

    for (const customer of customers) {
      // Get last 30 days of transactions
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { docs: recentTransactions } = await payload.find({
        collection: 'transaction',
        where: {
          and: [
            { customer: { equals: customer.id } },
            { transactionAt: { greater_than_equal: thirtyDaysAgo } },
            { bottleGiven: { greater_than: 0 } },
          ],
        },
        sort: '-transactionAt',
        limit: 15,
      })

      if (recentTransactions.length === 0) {
        console.warn(
          `No recent transactions found for customer ${customer.address} ${customer.name}`,
        )
        continue
      }

      const [latestTransaction] = recentTransactions
      const oldestTransactionDate = new Date(
        recentTransactions[recentTransactions.length - 1].transactionAt,
      )

      // Calculate base consumption rate
      const totalBottlesConsumed = this.calculateTotalBottlesConsumed(recentTransactions)

      const daysDiff = this.calculateDaysDiff(oldestTransactionDate, currentDate)

      const baseConsumptionRate = totalBottlesConsumed / daysDiff

      // Apply adjustments
      const customerTypeMultiplier = this.getWaterConsumptionAdjustmentFactor(baseConsumptionRate)

      const adjustedConsumptionRate =
        baseConsumptionRate * seasonalMultiplier * customerTypeMultiplier

      const invalidTransaction = this.isInvalidTransaction(latestTransaction)

      if (invalidTransaction) {
        console.warn(
          `Invalid transaction detected for customer ${customer.name} (${customer.address})`,
        )
      }

      const remainingBottles = this.calculateRemainingBottles(latestTransaction, invalidTransaction)

      const daysUntilDelivery = this.calculateDaysUntilDelivery(
        remainingBottles,
        adjustedConsumptionRate,
      )

      const nextDeliveryDate = this.calculateNextDeliveryDate(daysUntilDelivery)

      const priority = this.getPriority(daysUntilDelivery)

      predictions.push({
        customerId: customer.id,
        customerName: customer.name,
        invalidTransaction: invalidTransaction,
        address: customer.address || 'N/A',
        bottlesAtHome: latestTransaction.remainingBottles || 0,
        consumptionRate: baseConsumptionRate,
        adjustedConsumptionRate,
        daysUntilDelivery,
        nextDeliveryDate,
        priority,
      })
    }

    // Sort by priority and days until delivery
    return predictions.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return a.daysUntilDelivery - b.daysUntilDelivery
    })
  }

  generateDeliveryReport(predictions: DeliveryPrediction[]): string {
    const urgent = predictions.filter((p) => p.priority === 'URGENT').length
    const high = predictions.filter((p) => p.priority === 'HIGH').length
    const medium = predictions.filter((p) => p.priority === 'MEDIUM').length
    const low = predictions.filter((p) => p.priority === 'LOW').length

    return `
=== DELIVERY SCHEDULE REPORT ===
Generated: ${new Date().toISOString()}
Total Active Customers: ${predictions.length}

Priority Breakdown:
- URGENT (≤1 day): ${urgent} customers
- HIGH (≤2 days): ${high} customers  
- MEDIUM (≤3 days): ${medium} customers
- LOW (delivery not needed for 4+ days): ${low} customers

Upcoming Deliveries (Next 3 days):
${predictions
  .filter((p) => p.daysUntilDelivery <= 3)
  .slice(0, 10)
  .map(
    (p) =>
      `• ${p.customerName} (${p.address}) - ${p.daysUntilDelivery.toFixed(1)} days (${p.priority})`,
  )
  .join('\n')}
    `
  }
}

export const deliveryScheduler = new DeliveryScheduler()
