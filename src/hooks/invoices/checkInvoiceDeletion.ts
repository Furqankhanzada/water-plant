import { APIError, CollectionBeforeDeleteHook } from 'payload'

export const checkInvoiceDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Get the invoice document to check its transactions and payments
  const invoice = await req.payload.findByID({
    collection: 'invoice',
    id,
    depth: 0,
    select: {
      transactions: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new APIError('Invoice not found', 404);
  }

  // Check if the invoice has any payments
  if (invoice.payments && invoice.payments.length > 0) {
    throw new APIError('Cannot delete invoice: Invoice has payments. Please remove all payments first.', 400);
  }

  // If invoice has transactions, rollback their status to 'pending' before deletion
  if (invoice.transactions && invoice.transactions.length) {
    try {
      // Update all associated transactions to 'pending' status
      for (const transaction of invoice.transactions) {
        const transactionId = typeof transaction === 'string' ? transaction : transaction.id;
        if (transactionId) {
          await req.payload.update({
            collection: 'transaction',
            id: transactionId,
            data: {
              status: 'unpaid',
            },
          });
        }
      }
    } catch (error) {
      throw new APIError('Failed to rollback transaction status. Cannot delete invoice.', 500);
    }
  }
}
