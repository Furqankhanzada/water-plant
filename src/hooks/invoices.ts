import type { CollectionAfterChangeHook } from 'payload'
import { Invoice } from '@/payload-types'

export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  const invoiceResult = doc as Invoice

  console.log('Operation:', operation)
  console.log('Invoice transaction IDs:', invoiceResult.transaction)

  if (
    (operation === 'create' || operation === 'update') &&
    Array.isArray(invoiceResult.transaction) &&
    invoiceResult.transaction.length > 0
  ) {
    try {
      await payload.update({
        collection: 'transaction',
        where: {
          id: {
            in: invoiceResult.transaction,
          },
        },
        data: {
          status: 'pending',
        },
      })
      console.log('Transaction status updated to pending for IDs:', invoiceResult.transaction)
    } catch (error) {
      console.error('Error updating transaction status:', error)
    }
  } else {
    console.warn('No valid transaction IDs found for invoice:', invoiceResult)
  }

  return doc
}
