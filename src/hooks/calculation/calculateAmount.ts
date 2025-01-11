import type { CollectionBeforeChangeHook } from 'payload'

export const calculateDueAmountHook: CollectionBeforeChangeHook = async ({
  data,
  req: { payload },
}) => {
  const transactions = await payload.find({
    collection: 'transaction',
    where: {
      id: {
        in: data.transactions, 
      },
    },
  })

  console.log('transactions', transactions)

  // Calculate total from multiple transactions
  const totalAmount = transactions.docs.reduce((sum, transaction) => {
    return sum + (transaction.total ?? 0)
  }, 0)

  // Calculate due amount
  data.dueAmount = totalAmount - (data.paidAmount || 0)

  // Set status based on due amount and paid amount
  if (data.paidAmount === data.dueAmount) {
    data.status = 'paid'
  } else if (data.paidAmount > 0 && data.paidAmount < data.dueAmount) {
    data.status = 'partially-paid'
  } else if (data.paidAmount === 0) {
    data.status = 'unpaid'
  }

  return data
}
