import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook: changeTransactionsStatusOnRemoval
 *
 * Purpose:
 * When updating an invoice, if any linked transactions are removed
 * from the `transactions` array, we assume those transactions are no longer associated
 * with the invoice and should revert to `unpaid` status.
 *
 * This ensures transactional integrity, so that removed transactions
 * do not remain in an incorrect state (e.g., still marked as 'paid' or 'pending').
 */
export const changeTransactionsStatusOnRemoval: CollectionAfterChangeHook = async ({
  req: { payload },
  operation,
  data,
  previousDoc,
}) => {
  if (operation !== 'update') return data;

  const previousTransactions = previousDoc.transactions || [];
  const currentTransactions = data.transactions || [];

  // Find transactions that existed before but were removed in this update
  const removedTransactionIds = previousTransactions.filter(
    (prevId: string) => !currentTransactions.includes(prevId)
  );

  if (removedTransactionIds.length > 0) {
    // Set removed transactions back to 'unpaid'
    await payload.update({
      collection: 'transaction',
      where: {
        id: { in: removedTransactionIds },
      },
      data: {
        status: 'unpaid',
      },
    });
  }

  return data;
};
