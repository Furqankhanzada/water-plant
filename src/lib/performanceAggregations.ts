import { Payload } from 'payload'

/**
 * Utility functions for performance overview aggregations
 * Handles payment method breakdowns and geographic collection tracking
 */

export interface PaymentMethodBreakdown {
  cash: number
  online: number
}

export interface AreaCollection {
  areaId: string
  areaName: string
  collected: number
  remaining: number
  blocks: BlockCollection[]
}

export interface BlockCollection {
  blockId: string
  blockName: string
  collected: number
  remaining: number
}

/**
 * Calculate payment method breakdown for delivery revenue using optimized aggregation
 */
export const calculatePaymentMethodBreakdown = async (
  payload: Payload,
  startDate: Date,
  endDate: Date
): Promise<PaymentMethodBreakdown> => {
  console.log('💳 Calculating payment method breakdown for period:', startDate.toISOString(), 'to', endDate.toISOString())
  
  try {
    const result = await payload.db.collections['invoice'].aggregate([
      {
        $match: {
          deletedAt: { $exists: false },
        },
      },
      // Lookup customer information to filter by active customers
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      // Filter for active customers only (not soft deleted or archived)
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
        },
      },
      {
        $unwind: '$payments',
      },
      {
        $match: {
          'payments.paidAt': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$payments.type',
          total: { $sum: '$payments.amount' },
        },
      },
    ])

    console.log('💳 Payment method aggregation result:', result)

    const breakdown: PaymentMethodBreakdown = { cash: 0, online: 0 }
    
    result.forEach((item) => {
      if (item._id === 'cash') {
        breakdown.cash = item.total
      } else if (item._id === 'online') {
        breakdown.online = item.total
      }
    })

    console.log('💳 Payment breakdown:', breakdown)
    return breakdown
  } catch (error) {
    console.error('❌ Error in payment method breakdown calculation:', error)
    return { cash: 0, online: 0 }
  }
}

/**
 * Calculate area and block collection breakdown for delivery revenue using complex aggregation
 */
export const calculateGeographicCollection = async (
  payload: Payload,
  startDate: Date,
  endDate: Date
): Promise<AreaCollection[]> => {
  console.log('🔍 Calculating geographic collection for period:', startDate.toISOString(), 'to', endDate.toISOString())
  
  try {
    // Single complex aggregation query with $lookup
    const result = await payload.db.collections['invoice'].aggregate([
      // Match non-deleted invoices
      {
        $match: {
          deletedAt: { $exists: false },
        },
      },
      // Lookup customer information to filter by active customers
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      // Filter for active customers only (not soft deleted or archived)
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
        },
      },
      // Lookup area information
      {
        $lookup: {
          from: 'areas',
          localField: 'area',
          foreignField: '_id',
          as: 'areaInfo',
        },
      },
      // Lookup block information
      {
        $lookup: {
          from: 'blocks',
          localField: 'block',
          foreignField: '_id',
          as: 'blockInfo',
        },
      },
      // Unwind area and block info
      {
        $unwind: {
          path: '$areaInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$blockInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Unwind payments for collected amount calculation
      {
        $unwind: {
          path: '$payments',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add fields for collected and remaining calculations
      {
        $addFields: {
          // Calculate collected amount (payments within date range)
          collectedAmount: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$payments', null] },
                  { $gte: ['$payments.paidAt', startDate] },
                  { $lte: ['$payments.paidAt', endDate] },
                ],
              },
              then: '$payments.amount',
              else: 0,
            },
          },
          // Calculate remaining amount (only for latest invoices that are unpaid/partially paid)
          // This ensures we only count outstanding amounts from the most recent invoice per customer
          remainingAmount: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$isLatest', true] }, // Only latest invoices per customer
                  { $in: ['$status', ['unpaid', 'partially-paid']] },
                ],
              },
              then: '$remainingAmount',
              else: 0,
            },
          },
        },
      },
      // Group by area and block
      {
        $group: {
          _id: {
            areaId: '$areaInfo._id',
            areaName: '$areaInfo.name',
            blockId: '$blockInfo._id',
            blockName: '$blockInfo.name',
          },
          collected: { $sum: '$collectedAmount' },
          remaining: { $sum: '$remainingAmount' },
        },
      },
      // Group by area to aggregate block data
      {
        $group: {
          _id: {
            areaId: '$_id.areaId',
            areaName: '$_id.areaName',
          },
          totalCollected: { $sum: '$collected' },
          totalRemaining: { $sum: '$remaining' },
          blocks: {
            $push: {
              blockId: '$_id.blockId',
              blockName: '$_id.blockName',
              collected: '$collected',
              remaining: '$remaining',
            },
          },
        },
      },
      // Sort by area name
      {
        $sort: {
          '_id.areaName': 1,
        },
      },
    ])

    console.log('📊 Aggregation result:', JSON.stringify(result, null, 2))

    // Transform result to match our interface
    const areaCollections: AreaCollection[] = result.map((area) => ({
      areaId: area._id.areaId?.toString() || '',
      areaName: area._id.areaName || 'Unknown Area',
      collected: area.totalCollected || 0,
      remaining: area.totalRemaining || 0,
      blocks: (area.blocks || []).map((block: any) => ({
        blockId: block.blockId?.toString() || '',
        blockName: block.blockName || 'Unknown Block',
        collected: block.collected || 0,
        remaining: block.remaining || 0,
      })),
    }))

    console.log('✅ Geographic collection calculation complete. Total areas:', areaCollections.length)
    return areaCollections
  } catch (error) {
    console.error('❌ Error in geographic collection calculation:', error)
    return []
  }
}

/**
 * Calculate total delivery revenue for a time period using optimized aggregation
 */
export const calculateDeliveryRevenue = async (
  payload: Payload,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  console.log('💰 Calculating delivery revenue for period:', startDate.toISOString(), 'to', endDate.toISOString())
  
  try {
    const result = await payload.db.collections['invoice'].aggregate([
      {
        $match: {
          deletedAt: { $exists: false },
        },
      },
      // Lookup customer information to filter by active customers
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      // Filter for active customers only (not soft deleted or archived)
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
        },
      },
      {
        $unwind: '$payments',
      },
      {
        $match: {
          'payments.paidAt': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payments.amount' },
        },
      },
    ])

    const total = result[0]?.total || 0
    console.log('💰 Delivery revenue total:', total)
    return total
  } catch (error) {
    console.error('❌ Error in delivery revenue calculation:', error)
    return 0
  }
}
