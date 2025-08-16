import { BeforeDeleteHook } from 'node_modules/payload/dist/collections/config/types';
import { APIError } from 'payload'

export const checkInvoiceDeletion: BeforeDeleteHook = async ({ req, id }) => {
  // Get the invoice document to check its transactions
  const invoice = await req.payload.findByID({
    collection: 'invoice',
    id,
    depth: 0,
    select: {
      transactions: true,
    },
  });

  if (!invoice) {
    throw new APIError('Invoice not found', 404);
  }

  // Check if the invoice has any transactions
  if (invoice.transactions && invoice.transactions.length > 0) {
    throw new APIError('Cannot delete invoice: Invoice has associated transactions. Please remove all transactions first.', 400);
  }
}
