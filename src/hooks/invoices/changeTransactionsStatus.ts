import type { CollectionAfterOperationHook } from 'payload';
import { Invoice } from '@/payload-types';

/**
 * Hook: changeTransactionsStatusHook
 *
 * Purpose:
 * When an invoice is created or updated, update the status of all linked transactions
 * based on the status of the invoice.
 *
 * Logic:
 * - If the invoice's status is 'unpaid', associated transactions should be marked as 'pending'.
 * - Otherwise (e.g., 'paid' or 'partially-paid'), mark associated transactions as 'paid'.
 *
 * Note:
 * This hook only triggers on `create` and `updateByID` operations.
 * It assumes that during these operations, `transactions` is an array of transaction IDs (strings).
 */
export const changeTransactionsStatusHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req: { payload },
}) => {
  const invoice = result as Invoice;

  // Only run for create and updateByID operations
  if (!['create', 'updateByID'].includes(operation)) {
    return result;
  }

  const { transactions, status } = invoice;

  // Ensure transactions is an array of string IDs
  if (!Array.isArray(transactions) || typeof transactions[0] !== 'string') {
    return result;
  }

  // Determine new transaction status based on invoice status
  const newStatus = status === 'unpaid' ? 'pending' : 'paid';

  // Bulk update the status of all associated transactions
  await payload.update({
    collection: 'transaction',
    where: {
      id: {
        in: transactions,
      },
    },
    data: {
      status: newStatus,
    },
  });

  return result;
};
