import type { CollectionAfterOperationHook } from 'payload'

import { Invoice } from '@/payload-types'

export const afterOperationHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req: { payload },
}) => {
  const invoiceResult = result as Invoice
  if (operation === 'create' || operation === 'updateByID') {
    await payload.update({
      collection: 'transaction',
      where: {
        id: {
          in: invoiceResult.transactions,
        },
      },
      data: {
        status: invoiceResult.status === 'unpaid' ? 'pending' : 'paid',
      },
    })
  }
  return result
}
