import { BasePayload } from 'payload'

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
  bottlesAtHome: number
  consumptionRate: number
  adjustedConsumptionRate: number
  daysUntilDelivery: number
  nextDeliveryDate: Date
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
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

  private getCustomerTypeMultiplier(avgConsumption: number): number {
    // Adjusts prediction based on how much the customer normally consumes
    if (avgConsumption >= 2.0) return 1.1 // Heavy users (e.g., families, offices)
    if (avgConsumption >= 1.0) return 1.0 // Normal users
    if (avgConsumption >= 0.5) return 0.9 // Light users
    return 0.8 // Very light users
  }

  private calculateConfidence(transactions: any[]): number {
    let confidence = 0.3; // Lower base confidence
    const transactionCount = transactions.length;

    // 1. Transaction Count Factor (0-0.3) - Based on actual data patterns
    // Since avg monthly transactions = 6.15, in 30 days we expect ~6 transactions
    if (transactionCount >= 15) confidence += 0.3; // Excellent data (top 10% customers)
    else if (transactionCount >= 10) confidence += 0.25; // Very good data
    else if (transactionCount >= 6) confidence += 0.2; // Good data (around average)
    else if (transactionCount >= 3) confidence += 0.15; // Fair data
    else if (transactionCount >= 1) confidence += 0.1; // Minimal data

    // 2. Consumption Consistency Factor (0-0.25)
    const consumptionRates = transactions.map(t => t.bottleTaken || 0);
    const avgConsumption = consumptionRates.reduce((a, b) => a + b, 0) / consumptionRates.length;
    
    if (avgConsumption > 0) {
      const variance = consumptionRates.reduce((sum, rate) => sum + Math.pow(rate - avgConsumption, 2), 0) / consumptionRates.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgConsumption;
      
      // Based on DB analysis: CV <= 0.2 = Very consistent, CV <= 0.5 = Consistent
      if (coefficientOfVariation <= 0.2) confidence += 0.25; // Very consistent
      else if (coefficientOfVariation <= 0.5) confidence += 0.2; // Consistent  
      else if (coefficientOfVariation <= 1.0) confidence += 0.1; // Moderate
      // No bonus for inconsistent patterns (CV > 1.0)
    }

    // 3. Recent Activity Factor (0-0.15)
    const latestTransactionDate = new Date(transactions[0].transactionAt);
    const daysSinceLatest = (new Date().getTime() - latestTransactionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLatest <= 2) confidence += 0.15; // Very recent
    else if (daysSinceLatest <= 5) confidence += 0.12; // Recent
    else if (daysSinceLatest <= 10) confidence += 0.08; // Somewhat recent
    else if (daysSinceLatest <= 15) confidence += 0.04; // Getting stale
    // No bonus for very old data

    // 4. Data Integrity Factor (penalty for impossible transactions)
    const impossibleCount = transactions.filter(t => 
      t.bottleTaken > t.remainingBottles && t.remainingBottles > 0
    ).length;
    const integrityPenalty = impossibleCount / Math.max(1, transactionCount);
    confidence -= integrityPenalty * 0.25; // Up to 25% penalty for bad data

    // 5. Transaction Frequency Regularity (0-0.1)
    if (transactionCount >= 3) {
      const dates = transactions.map(t => new Date(t.transactionAt).getTime()).sort((a, b) => b - a);
      const intervals = [];
      for (let i = 0; i < dates.length - 1; i++) {
        intervals.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
      }
      
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const intervalCV = Math.sqrt(intervalVariance) / avgInterval;
        
        // Bonus for regular delivery patterns (low interval variation)
        if (intervalCV <= 0.3) confidence += 0.1; // Very regular
        else if (intervalCV <= 0.6) confidence += 0.05; // Somewhat regular
      }
    }

    // Cap confidence between 0.2 and 0.95 (never completely certain or too pessimistic)
    return Math.min(Math.max(confidence, 0.2), 0.95);
  }

  private getPriority(daysUntilDelivery: number): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (daysUntilDelivery <= 1) return 'URGENT'
    if (daysUntilDelivery <= 2) return 'HIGH'
    if (daysUntilDelivery <= 3) return 'MEDIUM'
    return 'LOW'
  }

  async calculateDeliverySchedule(match: any, payload: BasePayload): Promise<DeliveryPrediction[]> {
    const customers = await payload.db.collections.customers.collection.find(match).toArray()

    console.log("Customers to process:", customers.length)

    const predictions: DeliveryPrediction[] = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const seasonalMultiplier = this.getSeasonalMultiplier(currentMonth)

    for (const customer of customers) {
      // Get last 30 days of transactions
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentTransactions = await payload.db.collections.transaction.collection
        .find({
          customer: customer._id,
          transactionAt: { $gte: thirtyDaysAgo },
          bottleGiven: { $gt: 0 },
        })
        .sort({ transactionAt: -1 })
        .limit(15)
        .toArray()

      if (recentTransactions.length === 0) {
        console.warn(`No recent transactions found for customer ${customer.address} ${customer.name}`)
        continue
      }

      // Calculate base consumption rate
      const totalBottlesConsumed = recentTransactions.reduce(
        (sum, txn) => sum + (txn.bottleTaken || 0),
        0,
      )

      const latestTransaction = recentTransactions[0];
      const oldestTransactionDate = new Date(
        recentTransactions[recentTransactions.length - 1].transactionAt,
      )
      const daysDiff = Math.max(
        1,
        Math.ceil(
          (currentDate.getTime() - oldestTransactionDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )

      console.log(`${daysDiff}-${customer.name}`, daysDiff);

      const baseConsumptionRate = totalBottlesConsumed / daysDiff

      // Apply adjustments
      const customerTypeMultiplier = this.getCustomerTypeMultiplier(baseConsumptionRate)
      const adjustedConsumptionRate =
        baseConsumptionRate * seasonalMultiplier * customerTypeMultiplier

      // Calculate delivery timing
      const safetyBuffer = 1 // Keep 1 bottle as safety stock
      const daysUntilDelivery = Math.max(
        0,
        (latestTransaction.remainingBottles - safetyBuffer) / Math.max(0.1, adjustedConsumptionRate),
      )

      const nextDeliveryDate = new Date()
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + Math.ceil(daysUntilDelivery))

      const confidence = this.calculateConfidence(recentTransactions)
      const priority = this.getPriority(daysUntilDelivery)

      predictions.push({
        customerId: customer._id.toString(),
        customerName: customer.name,
        address: customer.address || 'N/A',
        bottlesAtHome: latestTransaction.remainingBottles || 0,
        consumptionRate: baseConsumptionRate,
        adjustedConsumptionRate,
        daysUntilDelivery,
        nextDeliveryDate,
        priority,
        confidence,
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

  async generateDeliveryReport(predictions: DeliveryPrediction[]): Promise<string> {
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
