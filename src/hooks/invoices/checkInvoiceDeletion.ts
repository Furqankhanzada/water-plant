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

  // If invoice has transactions/sales, rollback their status to 'unpaid' before deletion
  if (invoice.transactions && invoice.transactions.length) {
    try {
      // Update all associated transactions and sales to 'unpaid' status
      for (const item of invoice.transactions) {
        if (typeof item === 'object' && item.relationTo && item.value) {
          const collection = item.relationTo as 'transaction' | 'sales';
          const itemId = item.value as string;
          
          await req.payload.update({
            collection,
            id: itemId,
            data: {
              status: 'unpaid',
            },
          });
        }
      }
    } catch (error) {
      throw new APIError('Failed to rollback items status. Cannot delete invoice.', 500);
    }
  }
}
