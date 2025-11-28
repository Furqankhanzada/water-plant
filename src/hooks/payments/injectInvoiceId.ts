import { CollectionBeforeChangeHook } from 'payload'
import { Payment } from '@/payload-types'

/**
 * Helper function to extract ID from relationship field
 */
const getRelationId = (relation: string | { id: string } | null | undefined): string | undefined => {
  if (!relation) return undefined
  return typeof relation === 'string' ? relation : relation.id
}

/**
 * Hook: injectInvoiceId (Before Change)
 * 
 * Automatically sets the invoice field based on the customer's latest invoice.
 * 
 * WORKFLOW:
 * 
 * ON CREATE:
 * - Takes the customer ID from the payment data
 * - Finds the latest invoice for that customer (isLatest: true)
 * - Sets the invoice field to that invoice ID
 * 
 * ON UPDATE:
 * - If customer changed, finds new customer's latest invoice
 * - If customer stayed same but invoice is missing, finds latest invoice
 * 
 * This hook runs before the document is saved, ensuring the invoice field
 * is always populated correctly before the afterChange hook (syncPaymentWithInvoice) runs.
 */
export const injectInvoiceIdHook: CollectionBeforeChangeHook<Payment> = async ({
  data,
  req: { payload },
}) => {
  // Extract customer ID from the payment data
  const customerId = getRelationId(data.customer)

  // No customer selected - cannot determine invoice
  if (!customerId) {
    throw new Error('Customer is required to create a payment')
  }

  // Find the latest invoice for this customer
  const latestInvoices = await payload.find({
    collection: 'invoice',
    where: {
      customer: { equals: customerId },
      isLatest: { equals: true },
    },
    limit: 1,
    depth: 0,
  })

  // No latest invoice found for this customer - skip setting invoice
  if (latestInvoices.totalDocs === 0) {
    return data
  }

  const latestInvoice = latestInvoices.docs[0]

  // Inject the invoice ID into the payment data
  data.invoice = latestInvoice.id

  console.log(`✅ Injected invoice ${latestInvoice.id} for customer ${customerId}`)

  return data
}

