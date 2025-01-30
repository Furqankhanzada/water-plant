import type { CollectionAfterOperationHook } from 'payload'

import { Trip } from '@/payload-types'

export const createTransactionsOnTripCreate: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  const tripResult = result as Trip
  if (operation === 'create') {
    const customers = await req.payload.find({
      collection: 'customers',
      where: {
        area: {
          equals: tripResult.area,
        },
      },
      pagination: false,
    })
    for (const customer of customers.docs) {
      await req.payload.create({
        collection: 'transaction',
        data: {
          trip: tripResult.id,
          customer: customer.id,
          status: 'unpaid',
          bottleGiven: 0,
          bottleTaken: 0,
          total: 0,
          transactionAt: new Date(tripResult.tripAt).toISOString(),
        },
      })
    }
  }
  return result
}
