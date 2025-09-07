import { Customer } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * 🔄 Hook: updatePerformanceOverview (After Change)
 *
 * This hook runs after creating or updating a Customer. It calculates the total
 * number of active customers and updates the performance overview global.
 *
 * 1. 📊 Counts all active customers (not soft deleted, not archived)
 * 2. 🔄 Updates the performance overview global with totalActiveCustomers
 */

export const updatePerformanceOverview: CollectionAfterChangeHook<Customer> = async ({
  doc,
  req,
}) => {
  try {
    const payload = req.payload

    // Helper function to calculate total active customers
    const calculateTotalActiveCustomers = async () => {
      // Use aggregation to efficiently count active customers
      const result = await payload.db.collections['customers'].aggregate([
        {
          $match: {
            deletedAt: { $exists: false }, // Not soft deleted
            status: 'active', // Not archived
          },
        },
        {
          $count: 'totalActiveCustomers',
        },
      ])

      return result[0]?.totalActiveCustomers || 0
    }

    // Get current performance overview data
    const performanceOverview = await payload.findGlobal({
      slug: 'performance-overview',
    })

    // Calculate total active customers
    const totalActiveCustomers = await calculateTotalActiveCustomers()

    // Update the performance overview
    await payload.updateGlobal({
      slug: 'performance-overview',
      data: {
        ...performanceOverview,
        totalActiveCustomers: totalActiveCustomers,
      },
    })

    console.log(`✅ Performance overview updated with total active customers: ${totalActiveCustomers}`)
  } catch (error) {
    console.error('❌ Error updating performance overview:', error)
    // Don't throw the error to avoid breaking the customer creation/update
  }
}
