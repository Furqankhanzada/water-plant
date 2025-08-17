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

  // Check if the invoice has any transactions
  if (invoice.transactions && invoice.transactions.length > 0) {
    throw new APIError('Cannot delete invoice: Invoice has associated transactions. Please remove all transactions first.', 400);
  }
}
