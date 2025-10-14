import { CollectionAfterChangeHook } from 'payload'
import { Invoice } from '@/payload-types'

/**
 * Hook: linkUnconnectedPayments (After Change)
 * 
 * Updates payment documents to point to the newly created invoice.
 * The invoice already has the payment IDs (added in calculateAmounts beforeChange hook).
 * 
 * WORKFLOW:
 * 
 * ON CREATE:
 * - Gets payment IDs that were added to the invoice in beforeChange hook
 * - Updates each payment document to set its invoice field to the new invoice ID
 * - This completes the bidirectional relationship between invoice and payments
 * 
 * Note: We DON'T trigger syncPaymentWithInvoice hook because the invoice already
 * has the payments in its array. We're just updating the payment side of the relationship.
 */
export const linkUnconnectedPaymentsHook: CollectionAfterChangeHook<Invoice> = async ({
  doc,
  operation,
  req: { payload },
}) => {
  // Only run on create operation
  if (operation !== 'create') return doc

  // Get payment IDs from the invoice
  const paymentIds = doc.payments || []
  
  if (paymentIds.length === 0) {
    return doc
  }

  // Find payments that don't have an invoice set yet (unconnected ones)
  const unconnectedPayments = await payload.find({
    collection: 'payments',
    where: {
      id: { in: paymentIds },
      or: [
        { invoice: { exists: false } },
        { invoice: { equals: null } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  // Update each unconnected payment to point to this invoice
  if (unconnectedPayments.totalDocs > 0) {
    for (const payment of unconnectedPayments.docs) {
      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: { 
          invoice: doc.id 
        },
      })
    }
    
    console.log(`✅ Updated ${unconnectedPayments.totalDocs} payment document(s) to reference invoice ${doc.id}`)
  }

  return doc
}

