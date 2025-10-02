import { type CollectionAfterChangeHook } from 'payload'
import { Transaction } from '@/payload-types'

/**
 * Hook to sync transaction payment updates with invoice payments.
 *
 * When a transaction's payment is updated:
 * - Find a invoice that contain this transaction
 * - Update the corresponding payment in those invoices
 */
export const syncPaymentWithInvoicesHook: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  // Only run on updates where payment has changed
  if (operation !== 'update' || !previousDoc) {
    return doc
  }

  // Check if payment has actually changed
  const paymentChanged = JSON.stringify(doc.payment) !== JSON.stringify(previousDoc.payment)

  if (!paymentChanged) {
    return doc
  }

  // Find all invoices that contain this transaction
  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      and: [
        { 'transactions.relationTo': { equals: 'transaction' } },
        { 'transactions.value': { equals: doc.id } }
      ]
    },
    depth: 0,
    select: {
      id: true,
      payments: true,
      transactions: true,
    },
  })

  // Update each invoice's payments
  for (const invoice of invoices.docs) {
    const updatedPayments =
      invoice.payments?.map((payment) => {
        // Check if this payment is associated with our transaction
        // We'll use transaction ID to match since payments are created from transactions
        if (payment.transaction === doc.id) {
          return {
            ...doc.payment,
          }
        }
        return payment
      }) || []

    // Update the invoice with the modified payments
    await payload.update({
      collection: 'invoice',
      id: invoice.id,
      data: {
        payments: updatedPayments,
      },
    })
  }

  console.log(`✅ Synced payment for transaction ${doc.id} with ${invoices.docs.length} invoices`)

  return doc
}
