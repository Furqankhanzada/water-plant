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

export interface AreaBottlesDelivered {
  areaId: string
  areaName: string
  totalBottles: number
  blocks: BlockBottlesDelivered[]
}

export interface BlockBottlesDelivered {
  blockId: string
  blockName: string
  totalBottles: number
}

export interface AreaCustomers {
  areaId: string
  areaName: string
  totalCustomers: number
  blocks: BlockCustomers[]
}

export interface BlockCustomers {
  blockId: string
  blockName: string
  customerCount: number
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

    const breakdown: PaymentMethodBreakdown = { cash: 0, online: 0 }
    
    result.forEach((item) => {
      if (item._id === 'cash') {
        breakdown.cash = item.total
      } else if (item._id === 'online') {
        breakdown.online = item.total
      }
    })

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
      // Filter for active delivery customers, defaulting legacy customers without type to delivery
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
          $or: [
            { 'customerInfo.type': { $in: ['delivery', 'refill'] } },
            { 'customerInfo.type': { $exists: false } },
          ],
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
      // Calculate remaining amount before payments are unwound so we only count each invoice once
      {
        $addFields: {
          remainingAmount: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$isLatest', true] },
                  { $in: ['$status', ['unpaid', 'partially-paid']] },
                ],
              },
              then: '$totals.balance',
              else: 0,
            },
          },
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
        },
      },
      // Collapse payment rows back to a single invoice so remaining balance isn't duplicated
      {
        $group: {
          _id: '$_id',
          areaInfo: { $first: '$areaInfo' },
          blockInfo: { $first: '$blockInfo' },
          collected: { $sum: '$collectedAmount' },
          remaining: { $first: '$remainingAmount' },
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
          collected: { $sum: '$collected' },
          remaining: { $sum: '$remaining' },
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
      // Filter for active delivery customers, defaulting legacy customers without type to delivery
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
          $or: [
            { 'customerInfo.type': { $in: ['delivery', 'refill'] } },
            { 'customerInfo.type': { $exists: false } },
          ],
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

/**
 * Calculate bottles delivered by area and block using optimized aggregation
 */
export const calculateBottlesDeliveredByArea = async (
  payload: Payload,
  startDate: Date,
  endDate: Date
): Promise<AreaBottlesDelivered[]> => {
  console.log('🍼 Calculating bottles delivered by area for period:', startDate.toISOString(), 'to', endDate.toISOString())
  
  try {
    // Single complex aggregation query with $lookup
    const result = await payload.db.collections['transaction'].aggregate([
      // Match transactions within date range
      {
        $match: {
          transactionAt: { $gte: startDate, $lte: endDate },
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
      // Lookup area information from customer
      {
        $lookup: {
          from: 'areas',
          localField: 'customerInfo.area',
          foreignField: '_id',
          as: 'areaInfo',
        },
      },
      // Lookup block information from customer
      {
        $lookup: {
          from: 'blocks',
          localField: 'customerInfo.block',
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
      // Group by area and block
      {
        $group: {
          _id: {
            areaId: '$areaInfo._id',
            areaName: '$areaInfo.name',
            blockId: '$blockInfo._id',
            blockName: '$blockInfo.name',
          },
          totalBottles: { $sum: '$bottleGiven' },
        },
      },
      // Group by area to aggregate block data
      {
        $group: {
          _id: {
            areaId: '$_id.areaId',
            areaName: '$_id.areaName',
          },
          totalBottles: { $sum: '$totalBottles' },
          blocks: {
            $push: {
              blockId: '$_id.blockId',
              blockName: '$_id.blockName',
              totalBottles: '$totalBottles',
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


    // Transform result to match our interface
    const areaBottlesDelivered: AreaBottlesDelivered[] = result.map((area) => ({
      areaId: area._id.areaId?.toString() || '',
      areaName: area._id.areaName || 'Unknown Area',
      totalBottles: area.totalBottles || 0,
      blocks: (area.blocks || []).map((block: any) => ({
        blockId: block.blockId?.toString() || '',
        blockName: block.blockName || 'Unknown Block',
        totalBottles: block.totalBottles || 0,
      })),
    }))

    console.log('✅ Bottles delivered by area calculation complete. Total areas:', areaBottlesDelivered.length)
    return areaBottlesDelivered
  } catch (error) {
    console.error('❌ Error in bottles delivered by area calculation:', error)
    return []
  }
}

/**
 * Calculate sales revenue from invoices (filler and bottles channels only)
 * This excludes counter and other channels which are handled separately
 */
export const calculateInvoiceSalesRevenue = async (
  payload: Payload,
  startDate: Date,
  endDate: Date
): Promise<Array<{ channel: string; total: number }>> => {
  console.log('💰 Calculating invoice sales revenue for period:', startDate.toISOString(), 'to', endDate.toISOString())
  
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
      // Unwind customer info to work with single customer object
      {
        $unwind: '$customerInfo',
      },
      // Filter for active customers with specific types (filler and shop)
      {
        $match: {
          'customerInfo.status': 'active',
          'customerInfo.deletedAt': { $exists: false },
          'customerInfo.type': {
            $in: ['filler', 'shop'],
          },
        },
      },
      // Unwind payments to process each payment
      {
        $unwind: '$payments',
      },
      // Filter for payments in the date range
      {
        $match: {
          'payments.paidAt': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      // Group by customer type and sum payment amounts
      {
        $group: {
          _id: '$customerInfo.type',
          total: { $sum: '$payments.amount' },
        },
      },
      // Project to match expected format
      {
        $project: {
          channel: '$_id',
          total: 1,
          _id: 0,
        },
      },
    ])

    console.log('💰 Invoice sales revenue calculated:', result)
    return result
  } catch (error) {
    console.error('❌ Error in invoice sales revenue calculation:', error)
    return []
  }
}

/**
 * Calculate customers by area and block using optimized aggregation
 */
export const calculateCustomersByArea = async (
  payload: Payload
): Promise<AreaCustomers[]> => {
  console.log('👥 Calculating customers by area')
  
  try {
    // Single complex aggregation query with $lookup
    const result = await payload.db.collections['customers'].aggregate([
      // Match active customers only
      {
        $match: {
          status: 'active',
          deletedAt: { $exists: false },
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
      // Group by area and block
      {
        $group: {
          _id: {
            areaId: '$areaInfo._id',
            areaName: '$areaInfo.name',
            blockId: '$blockInfo._id',
            blockName: '$blockInfo.name',
          },
          customerCount: { $sum: 1 },
        },
      },
      // Group by area to aggregate block data
      {
        $group: {
          _id: {
            areaId: '$_id.areaId',
            areaName: '$_id.areaName',
          },
          totalCustomers: { $sum: '$customerCount' },
          blocks: {
            $push: {
              blockId: '$_id.blockId',
              blockName: '$_id.blockName',
              customerCount: '$customerCount',
            },
          },
        },
      },
      // Sort by total customers descending
      {
        $sort: {
          totalCustomers: -1,
        },
      },
    ])

    // Transform result to match our interface
    const areaCustomers: AreaCustomers[] = result.map((area) => ({
      areaId: area._id.areaId?.toString() || '',
      areaName: area._id.areaName || 'Unknown Area',
      totalCustomers: area.totalCustomers || 0,
      blocks: (area.blocks || []).map((block: any) => ({
        blockId: block.blockId?.toString() || '',
        blockName: block.blockName || 'Unknown Block',
        customerCount: block.customerCount || 0,
      })),
    }))

    console.log('✅ Customers by area calculation complete. Total areas:', areaCustomers.length)
    return areaCustomers
  } catch (error) {
    console.error('❌ Error in customers by area calculation:', error)
    return []
  }
}
