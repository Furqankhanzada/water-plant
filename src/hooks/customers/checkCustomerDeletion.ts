import { APIError, CollectionBeforeDeleteHook } from 'payload'

export const checkCustomerDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Check for related transactions
  const transactions = await req.payload.find({
    collection: 'transaction',
    where: {
      customer: { equals: id }
    },
    limit: 1,
    depth: 0,
    select: {
      customer: true,
    },
  });

  if (transactions.docs.length > 0) {
    throw new APIError('Cannot delete customer: Customer has associated transactions. Please delete all transactions first.', 400);
  }

  // Check for related invoices
  const invoices = await req.payload.find({
    collection: 'invoice',
    where: {
      customer: { equals: id }
    },
    limit: 1,
    depth: 0,
    select: {
      customer: true,
    },
  });

  if (invoices.docs.length > 0) {
    throw new APIError('Cannot delete customer: Customer has associated invoices. Please delete all invoices first.', 400);
  }

  // Check for related messages
  const messages = await req.payload.find({
    collection: 'messages',
    where: {
      from: { in: [id] }
    },
    limit: 1,
    depth: 0,
    select: {
      from: true,
    },
  });

  if (messages.docs.length > 0) {
    throw new APIError('Cannot delete customer: Customer has associated messages. Please delete all messages first.', 400);
  }

  // Check for related requests
  const requests = await req.payload.find({
    collection: 'requests',
    where: {
      from: { in: [id] }
    },
    limit: 1,
    depth: 0,
    select: {
      from: true,
    },
  });

  if (requests.docs.length > 0) {
    throw new APIError('Cannot delete customer: Customer has associated requests. Please delete all requests first.', 400);
  }
}
