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

  if (invoices.docs.length > 0) {
    throw new APIError('Cannot delete transaction: Transaction is associated with an invoice. Please remove it from the invoice first.', 400);
  }

  // Check if the transaction is part of an active trip
  const transaction = await req.payload.findByID({
    collection: 'transaction',
    id,
    depth: 0,
    select: {
      trip: true,
    },
  });

  if (!transaction) {
    throw new APIError('Transaction not found', 404);
  }

  if (transaction.trip) {
    const trip = await req.payload.findByID({
      collection: 'trips',
      id: transaction.trip as string,
      depth: 0,
      select: {
        status: true,
      },
    });

    if (trip && trip.status === 'inprogress') {
      throw new APIError('Cannot delete transaction: Transaction is part of an active trip. Please complete or cancel the trip first.', 400);
    }
  }
}
