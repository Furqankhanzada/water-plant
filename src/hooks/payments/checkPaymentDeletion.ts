import { APIError, CollectionBeforeDeleteHook } from 'payload'

/**
 * Hook: checkPaymentDeletion (Before Delete)
 * 
 * Prevents deletion of payments that are associated with invoices.
 * User must remove the payment from the invoice first.
 */
export const checkPaymentDeletion: CollectionBeforeDeleteHook = async ({
  id,
  req: { payload },
}) => {
  // Check if the payment is referenced by any invoices
  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      payments: { in: [id] }
    },
    limit: 1,
    depth: 0,
    select: { payments: true },
  })

  if (invoices.totalDocs) {
    throw new APIError('Cannot delete payment: Payment is associated with an invoice. Please remove it from the invoice first.', 400)
  }
}

