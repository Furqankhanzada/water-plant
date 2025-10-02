import { type CollectionBeforeChangeHook } from 'payload'
import { generateTripCustomers, insertCustomersTransactions } from '../../aggregations/trips'
import { Trip } from '@/payload-types'

/**
 * Hook to toggle trip transactions when the trip status changes.
 *
 * - On status change to "complete":
 *   → Deletes placeholder (0/0) transactions for the trip.
 *
 * - On status change to "inprogress":
 *   → Generates trip customers and inserts their initial transactions.
 */
export const toggleTransactionsOnStatusChangeHook: CollectionBeforeChangeHook<Trip> = async ({
  data,
  originalDoc,
  operation,
  req: { payload },
}) => {
  const isUpdate = operation === 'update'
  const statusChanged = originalDoc && originalDoc.status !== data.status

  if (!(isUpdate && statusChanged)) {
    return data
  }

  if (data.status === 'complete') {
    const tripId = originalDoc.id

    // Delete placeholder transactions (only if no payment or payment amount is 0)
    await payload.delete({
      collection: 'transaction',
      where: {
        trip: { equals: tripId },
        bottleGiven: { equals: 0 },
        bottleTaken: { equals: 0 },
        or: [{ 'payment.amount': { exists: false } }, { 'payment.amount': { less_than_equal: 0 } }],
      },
    })
  }

  if (data.status === 'inprogress') {
    const tripCustomers = await generateTripCustomers(originalDoc, payload)
    await insertCustomersTransactions(tripCustomers, originalDoc, payload)
  }

  return data
}
