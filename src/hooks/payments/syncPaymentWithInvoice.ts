import { CollectionAfterChangeHook } from 'payload'
import { Payment } from '@/payload-types'

/**
 * Helper function to extract ID from relationship field
 */
const getRelationId = (relation: string | { id: string } | null | undefined): string | undefined => {
  if (!relation) return undefined
  return typeof relation === 'string' ? relation : relation.id
}

/**
 * Hook: syncPaymentWithInvoice (After Change)
 * 
 * Keeps payment-invoice relationship in sync and triggers invoice recalculation.
 * Handles cases where invoice field can be undefined (not required).
 * 
 * WORKFLOW:
 * 
 * ON CREATE:
 * - If invoice exists: adds the new payment ID to the invoice's payments array
 * - If no invoice: payment created without invoice (nothing to sync)
 * - Invoice update triggers calculateAmounts hook → totals recalculated
 * 
 * ON UPDATE:
 * - Case 1: Invoice changed (could be: invoice A → B, undefined → A, A → undefined)
 *   → If had old invoice: remove payment ID from old invoice (recalculates)
 *   → If has new invoice: add payment ID to new invoice (recalculates)
 * 
 * - Case 2: Payment updated but invoice stayed same (amount, type, paidAt, etc.)
 *   → If invoice exists: update invoice's updatedAt to trigger recalculation
 *   → calculateAmounts hook runs → totals and status updated
 * 
 * This ensures invoices always reflect accurate payment totals and status.
 */
export const syncPaymentWithInvoiceHook: CollectionAfterChangeHook<Payment> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  // Extract invoice IDs from relationship fields
  // Handles both string IDs and populated objects (e.g., "abc123" or { id: "abc123", ... })
  const invoiceId = getRelationId(doc.invoice)
  const previousInvoiceId = getRelationId(previousDoc?.invoice)

  // No invoice associated now and before - nothing to sync
  if (!invoiceId && !previousInvoiceId) {
    return doc
  }

  // CREATE: Add payment to invoice (if invoice exists)
  if (operation === 'create') {
    if (!invoiceId) {
      console.log(`ℹ️ Payment ${doc.id} created without an invoice`)
      return doc
    }

    // Fetch the invoice to get its current payments array
    const invoice = await payload.findByID({
      collection: 'invoice',
      id: invoiceId,
      depth: 0,
      select: { payments: true },
    })

    const payments = invoice.payments || []
    
    // Add this payment's ID to the invoice (if not already present)
    // Updating the invoice triggers calculateAmounts → totals recalculated
    if (!payments.includes(doc.id)) {
      await payload.update({
        collection: 'invoice',
        id: invoiceId,
        data: { payments: [...payments, doc.id] },
      })
      console.log(`✅ Added payment ${doc.id} to invoice ${invoiceId}`)
    }
    return doc
  }

  // UPDATE: Handle invoice changes and recalculation
  if (operation === 'update' && previousDoc) {
    // Check if invoice changed (handles all cases: A→B, undefined→A, A→undefined)
    const invoiceChanged = previousInvoiceId !== invoiceId

    // Case 1: Invoice changed
    if (invoiceChanged) {
      // Step 1: Remove payment from old invoice (if there was one)
      if (previousInvoiceId) {
        const oldInvoice = await payload.findByID({
          collection: 'invoice',
          id: previousInvoiceId,
          depth: 0,
          select: { payments: true },
        })
        
        // Filter out this payment ID and update old invoice
        // This triggers calculateAmounts on old invoice → totals recalculated
        await payload.update({
          collection: 'invoice',
          id: previousInvoiceId,
          data: { payments: (oldInvoice.payments || []).filter(p => p !== doc.id) },
        })
        console.log(`✅ Removed payment ${doc.id} from old invoice ${previousInvoiceId}`)
      }

      // Step 2: Add payment to new invoice (if there is one)
      if (invoiceId) {
        const newInvoice = await payload.findByID({
          collection: 'invoice',
          id: invoiceId,
          depth: 0,
          select: { payments: true },
        })

        const payments = newInvoice.payments || []
        
        // Add to new invoice if not already present
        // This triggers calculateAmounts on new invoice → totals recalculated
        if (!payments.includes(doc.id)) {
          await payload.update({
            collection: 'invoice',
            id: invoiceId,
            data: { payments: [...payments, doc.id] },
          })
          console.log(`✅ Added payment ${doc.id} to new invoice ${invoiceId}`)
        }
      } else {
        console.log(`ℹ️ Payment ${doc.id} no longer has an invoice`)
      }
    } 
    // Case 2: Payment data updated (amount, type, paidAt, comments, etc.) but invoice stayed same
    else if (invoiceId) {
      // Only trigger recalculation if there's an invoice
      // Update invoice's updatedAt to trigger beforeChange hooks
      // This runs calculateAmounts hook → totals recalculated → status updated
      await payload.update({
        collection: 'invoice',
        id: invoiceId,
        data: { updatedAt: new Date().toISOString() },
      })
      console.log(`✅ Recalculated totals for invoice ${invoiceId}`)
    }
  }

  return doc
}

