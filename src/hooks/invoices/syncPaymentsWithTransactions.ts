import { type CollectionBeforeChangeHook } from 'payload'
import { Invoice } from '@/payload-types'

/**
 * Hook to sync payments with transactions in invoices.
 * 
 * - When transactions are added: Extract payments and add to invoice payments
 * - When transactions are removed: Remove corresponding payments from invoice
 */
export const syncPaymentsWithTransactionsHook: CollectionBeforeChangeHook<Invoice> = async ({
  data,
  originalDoc,
  operation,
  req: { payload },
}) => {
  const isUpdate = operation === 'update'
  
  if (!isUpdate || !originalDoc) {
    return data
  }

  // Get current and previous transaction IDs (only for 'transaction' relationTo)
  const currentTransactionIds = data.transactions
    ?.filter(t => t.relationTo === 'transaction')
    ?.map(t => typeof t.value === 'string' ? t.value : t.value?.id)
    ?.filter(Boolean) || []

  const previousTransactionIds = originalDoc.transactions
    ?.filter(t => t.relationTo === 'transaction')
    ?.map(t => typeof t.value === 'string' ? t.value : t.value?.id)
    ?.filter(Boolean) || []
  
  // Find added and removed transactions
  const addedTransactionIds = currentTransactionIds.filter(id => !previousTransactionIds.includes(id))
  const removedTransactionIds = previousTransactionIds.filter(id => !currentTransactionIds.includes(id))
  
  let updatedPayments = [...(data.payments || [])]
  
  // Handle added transactions - extract payments
  if (addedTransactionIds.length > 0) {
    const addedTransactions = await payload.find({
      collection: 'transaction',
      where: {
        id: { in: addedTransactionIds }
      },
      depth: 0,
      select: {
        payment: true,
        trip: true,
      }
    })
    
    for (const transaction of addedTransactions.docs) {
      if (transaction.payment?.amount && transaction.payment.amount > 0) {
        const payment = {
          type: transaction.payment.type,
          amount: transaction.payment.amount,
          paidAt: transaction.payment.paidAt!,
          comments: transaction.payment.comments,
          trip: transaction.trip,
          transaction: transaction.id,
        }
        
        // Check if payment for this transaction already exists
        const isExists = updatedPayments.some(p => p.transaction === transaction.id)

        // Update or add payment for this transaction
        updatedPayments = isExists
          ? updatedPayments.map(p => p.transaction === transaction.id ? payment : p)
          : [...updatedPayments, payment]
      }
    }
  }
  
  // Handle removed transactions - remove corresponding payments
  if (removedTransactionIds.length > 0) {
    const removedTransactions = await payload.find({
      collection: 'transaction',
      where: {
        id: { in: removedTransactionIds }
      },
      depth: 0,
      select: {
        trip: true,
      }
    })
    
    const removedTripIds = removedTransactions.docs.map(t => t.trip).filter(Boolean)
    
    // Remove payments for removed transactions
    updatedPayments = updatedPayments.filter(p => !removedTripIds.includes(p.trip))
  }
  
  // Update the payments array
  data.payments = updatedPayments
  
  return data
}
