import { APIError, CollectionBeforeDeleteHook } from 'payload'

export const checkTripDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Check for related transactions
  const transactions = await req.payload.find({
    collection: 'transaction',
    where: {
      trip: { equals: id }
    },
    limit: 1,
    depth: 0,
    select: {
      trip: true,
    },
  });

  if (transactions.docs.length > 0) {
    throw new APIError('Cannot delete trip: Trip has associated transactions. Please delete all transactions first.', 400);
  }
}
