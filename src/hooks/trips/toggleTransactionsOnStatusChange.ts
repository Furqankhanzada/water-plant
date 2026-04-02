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
  if (!(isUpdate && originalDoc)) {
    return data
  }

  const nextTrip = { ...originalDoc, ...data, id: originalDoc.id } as Trip

  const toIds = (value?: (string | { id: string })[] | null) =>
    (value || [])
      .map((item) => (typeof item === 'string' ? item : item.id))
      .sort()

  const originalAreaIds = toIds(originalDoc.areas)
  const nextAreaIds = toIds(nextTrip.areas)
  const areasChanged = JSON.stringify(originalAreaIds) !== JSON.stringify(nextAreaIds)

  const originalBlockIds = toIds(originalDoc.blocks || [])
  const nextBlockIds = toIds(nextTrip.blocks || [])
  const blocksChanged = JSON.stringify(originalBlockIds) !== JSON.stringify(nextBlockIds)

  const statusChanged = originalDoc.status !== nextTrip.status
  const deliveryDayChanged = originalDoc.deliveryDay !== nextTrip.deliveryDay

  if (!(areasChanged || blocksChanged || statusChanged || deliveryDayChanged)) {
    return data
  }

  await payload.delete({
    collection: 'transaction',
    where: {
      trip: { equals: originalDoc.id },
      bottleGiven: { equals: 0 },
      bottleTaken: { equals: 0 },
    },
  })

  const tripCustomers = await generateTripCustomers(nextTrip, payload)
  await insertCustomersTransactions(tripCustomers, nextTrip, payload)

  return data
}
