import { APIError, CollectionBeforeDeleteHook } from 'payload'

export const checkTransactionDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Check if the transaction is referenced by any invoices
  const invoices = await req.payload.find({
    collection: 'invoice',
    where: {
      transactions: { in: [id] }
    },
    limit: 1,
    depth: 0,
    select: {
      transactions: true,
    },
  });

  if (invoices.totalDocs) {
    throw new APIError('Cannot delete transaction: Transaction is associated with an invoice. Please remove it from the invoice first.', 400);
  }
}
