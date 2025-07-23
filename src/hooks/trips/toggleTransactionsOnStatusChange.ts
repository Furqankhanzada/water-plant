import type { CollectionBeforeChangeHook } from 'payload'
import { generateTripCustomers, insertCustomersTransactions } from './utils';

export const toggleTransactionsOnStatusChangeHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req: { payload },
}) => {
  if (operation === 'update' && originalDoc.status !== data.status) {
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
      const tripCustomers = await generateTripCustomers(originalDoc, payload);
      await insertCustomersTransactions(tripCustomers, originalDoc, payload);
    }
  }
  return data
}
