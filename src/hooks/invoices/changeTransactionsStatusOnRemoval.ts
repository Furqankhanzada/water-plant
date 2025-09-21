import { Invoice } from '@/payload-types';
import type { CollectionAfterChangeHook } from 'payload'


/**
 * Hook: changeTransactionsStatusOnRemoval
 *
 * Purpose:
 * When updating an invoice, if any linked transactions or sales are removed
 * from the `transactions` array, we assume those items are no longer associated
 * with the invoice and should revert to `unpaid` status.
 *
 * This ensures transactional integrity, so that removed items
 * do not remain in an incorrect state (e.g., still marked as 'paid' or 'pending').
 * 
 * Now supports both 'transaction' and 'sales' relationships.
 */
export const changeTransactionsStatusOnRemoval: CollectionAfterChangeHook<Invoice> = async ({
  req: { payload },
  operation,
  doc,
  previousDoc,
}) => {
  if (operation !== 'update') return doc;

  const previousTransactions = previousDoc.transactions || []
  const currentTransactions = doc.transactions || []

  // Find removed items by comparing IDs and collections
  const removedItems = previousTransactions.filter(prevItem => 
    !currentTransactions.some(currentItem => 
      prevItem.relationTo === currentItem.relationTo && 
      (typeof prevItem.value === 'string' ? prevItem.value : prevItem.value.id) === 
      (typeof currentItem.value === 'string' ? currentItem.value : currentItem.value.id)
    )
  )

  // Group removed items by collection type
  const removedTransactions = removedItems
    .filter(item => item.relationTo === 'transaction')
    .map(item => typeof item.value === 'string' ? item.value : item.value.id)

  const removedSales = removedItems
    .filter(item => item.relationTo === 'sales')
    .map(item => typeof item.value === 'string' ? item.value : item.value.id)

  // Update removed transactions to 'unpaid'
  if (removedTransactions.length) {
    await payload.update({
      collection: 'transaction',
      where: {
        id: { in: removedTransactions },
      },
      data: {
        status: 'unpaid',
      },
    })
  }

  // Update removed sales to 'unpaid'
  if (removedSales.length) {
    await payload.update({
      collection: 'sales',
      where: {
        id: { in: removedSales },
      },
      data: {
        status: 'unpaid',
      },
    })
  }

  return doc;
}
