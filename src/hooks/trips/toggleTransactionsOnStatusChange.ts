import type { CollectionBeforeChangeHook } from 'payload'

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
      const existingTransactions = await payload.find({
        collection: 'transaction',
        where: {
          trip: {
            equals: originalDoc.id,
          },
        },
        depth: 0,
        select: {
          customer: true,
          trip: true,
        },
        pagination: false,
      })

      const customers = await payload.find({
        collection: 'customers',
        where: {
          id: {
            not_in: existingTransactions.docs.map((t) => t.customer),
          },
          area: {
            in: data.areas,
          },
        },
        select: {},
        depth: 0,
        pagination: false,
      })
      for (const customer of customers.docs) {
        payload.create({
          collection: 'transaction',
          data: {
            trip: originalDoc.id,
            customer: customer.id,
            status: 'unpaid',
            bottleGiven: 0,
            bottleTaken: 0,
            total: 0,
            transactionAt: new Date(data.tripAt).toISOString(),
          },
        })
      }
    }
  }
  return data
}
