import { type CollectionAfterChangeHook } from 'payload'
import { Transaction } from '@/payload-types'

/**
 * Updates invoice payments based on transaction payment changes
 */
const updateInvoicePayments = (invoicePayments: any[] | undefined | null, transaction: Transaction) => {
  if (!invoicePayments) return []

  const transactionId = transaction.id
  const paymentAmount = transaction.payment?.amount || 0
  const hasValidPayment = paymentAmount > 0

  const basePayment = {
    ...transaction.payment,
    trip: transaction.trip,
    transaction: transactionId
  }

  console.log("basePayment", basePayment)

  // Update existing payments or remove them
  const updatedPayments = invoicePayments
    .map(payment => {
      return payment.transaction === transactionId
        ? hasValidPayment
          ? { ...payment, ...basePayment }
          : null
        : payment
    })
    .filter(Boolean)

  // Add new payment if transaction has valid payment and no existing payment
  const isExists = invoicePayments.some(p => p.transaction === transactionId)
  const createNewPayment = !isExists && hasValidPayment

  if (createNewPayment) {
    updatedPayments.push({ ...basePayment })
  }

  console.log("updatedPayments", updatedPayments)

  return updatedPayments
}

/**
 * Hook to sync transaction payment updates with invoice payments.
 *
 * When a transaction's payment is updated:
 * - Find invoices that contain this transaction
 * - Update the corresponding payment in those invoices
 */
export const syncPaymentWithInvoicesHook: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  // Early returns for non-update operations or unchanged payments
  if (operation !== 'update' || !previousDoc) return doc
  if (JSON.stringify(doc.payment) === JSON.stringify(previousDoc.payment)) return doc

  // Find invoices containing this transaction
  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      and: [
        { 'transactions.relationTo': { equals: 'transaction' } },
        { 'transactions.value': { equals: doc.id } }
      ]
    },
    depth: 0,
    select: { id: true, payments: true },
  })

  // Update each invoice's payments
  await Promise.all(
    invoices.docs.map(invoice =>
      payload.update({
        collection: 'invoice',
        id: invoice.id,
        data: { payments: updateInvoicePayments(invoice.payments, doc) },
      })
    )
  )

  return doc
}
