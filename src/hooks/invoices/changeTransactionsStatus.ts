import type { CollectionAfterOperationHook } from 'payload'
import { Invoice } from '@/payload-types'

/**
 * Hook: changeTransactionsStatusHook
 *
 * Purpose:
 * When an invoice is created or updated, update the status of all linked transactions and sales
 * based on the status of the invoice.
 *
 * Logic:
 * - If the invoice's status is 'unpaid', associated transactions and sales should be marked as 'pending'.
 * - Otherwise (e.g., 'paid' or 'partially-paid'), mark associated transactions and sales as 'paid'.
 *
 * Note:
 * This hook only triggers on `create` and `updateByID` operations.
 * It handles both 'transaction' and 'sales' collections in the transactions array.
 */
export const changeTransactionsStatusHook: CollectionAfterOperationHook<'invoice'> = async ({
  result,
  operation,
  req: { payload },
}) => {
  const invoice = result as Invoice

  // Only run for create and updateByID operations
  if (!['create', 'updateByID'].includes(operation)) {
    return result
  }

  const { transactions, status } = invoice

  // Ensure transactions is an array
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return result
  }

  // Determine new status based on invoice status
  const newStatus = status === 'unpaid' ? 'pending' : 'paid'

  // Group transactions by collection type
  const transactionIds: string[] = []
  const salesIds: string[] = []

  for (const item of transactions) {
    if (typeof item === 'object' && item.relationTo && item.value) {
      const itemId = typeof item.value === 'string' ? item.value : item.value.id
      
      if (item.relationTo === 'transaction') {
        transactionIds.push(itemId)
      } else if (item.relationTo === 'sales') {
        salesIds.push(itemId)
      }
    }
  }

  // Update transactions if any exist
  if (transactionIds.length) {
    await payload.update({
      collection: 'transaction',
      where: {
        id: {
          in: transactionIds,
        },
      },
      data: {
        status: newStatus,
      },
    })
  }

  // Update sales if any exist
  if (salesIds.length) {
    await payload.update({
      collection: 'sales',
      where: {
        id: {
          in: salesIds,
        },
      },
      data: {
        status: newStatus,
      },
    })
  }

  return result
}
