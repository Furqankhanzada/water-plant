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
  
  switch (data.status) {
    case 'complete': {
      await payload.delete({
        collection: 'transaction',
        where: {
          trip: { equals: originalDoc.id },
          bottleGiven: { equals: 0 },
          bottleTaken: { equals: 0 },
        },
      })
      break
    }
    case 'inprogress': {
      const tripCustomers = await generateTripCustomers(originalDoc, payload)
      await insertCustomersTransactions(tripCustomers, originalDoc, payload)
      break
    }
    default:
      break
  }

  return data
}
