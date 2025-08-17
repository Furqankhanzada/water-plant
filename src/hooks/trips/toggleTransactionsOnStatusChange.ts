import { type CollectionBeforeChangeHook } from 'payload'
import { generateTripCustomers, insertCustomersTransactions } from '../../aggregations/trips'
import { Trip } from '@/payload-types'

export const toggleTransactionsOnStatusChangeHook: CollectionBeforeChangeHook<Trip> = async ({
  data,
  originalDoc,
  operation,
  req: { payload },
}) => {
  if (operation === 'update' && originalDoc && originalDoc.status !== data.status) {
    if (data.status === 'complete') {
      payload.delete({
        collection: 'transaction',
        where: {
          trip: {
            equals: originalDoc.id,
          },
          bottleGiven: {
            equals: 0,
          },
          bottleTaken: {
            equals: 0,
          },
        },
      })
    } else if (data.status === 'inprogress') {
      const tripCustomers = await generateTripCustomers(originalDoc, payload)

      const { docs: transactions } = await payload.find({
        collection: 'transaction',
        where: {
          id: { in: data.transactions?.docs || [] },
        },
        select: {
          customer: true,
        },
        depth: 0,
        pagination: false,
      })

      const customerIds = new Set(transactions.map((tx) => tx.customer))

      const filteredTripCustomers = tripCustomers.filter(({ customer }) => {
        return !customerIds.has(customer)
      })

      await insertCustomersTransactions(filteredTripCustomers, originalDoc, payload)
    }
  }
  return data
}
