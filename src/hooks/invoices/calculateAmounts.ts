import type { CollectionBeforeChangeHook } from 'payload'

export const calculateAmountsHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req: { payload },
}) => {
  const transactions = await payload.find({
    collection: 'transaction',
    where: {
      id: {
        in: data.transactions,
      },
    },
    pagination: false,
  })

  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      customer: {
        contains: data.customer,
      },
      id: {
        not_equals: originalDoc.id,
      },
      dueAt: {
        less_than: data.dueAt,
      },
    },
    limit: 1,
    sort: '-dueAt',
    depth: 0,
    select: {
      advanceAmount: true,
      remainingAmount: true,
    },
    pagination: false,
  })

  if (invoices.docs.length) {
    const previousInvoice = invoices.docs[0]
    data.previousBalance = previousInvoice.remainingAmount
    data.previousAdvanceAmount = previousInvoice.advanceAmount
  }

  // Calculate total from multiple transactions
  const totalAmount = transactions.docs.reduce((sum, transaction) => {
    return sum + transaction.total
  }, 0)

  // Calculate due amount
  data.netTotal = totalAmount
  data.dueAmount = data.netTotal + (data.previousBalance || data.previousAdvanceAmount)
  data.remainingAmount = data.dueAmount - data.paidAmount > 0 ? data.dueAmount - data.paidAmount : 0
  data.advanceAmount = data.dueAmount - data.paidAmount < 0 ? data.dueAmount - data.paidAmount : 0

  // Set status based on due amount and paid amount
  if (data.paidAmount === data.dueAmount || data.paidAmount > data.dueAmount) {
    data.status = 'paid'
  } else if (data.paidAmount > 0 && data.paidAmount < data.dueAmount) {
    data.status = 'partially-paid'
  } else if (data.paidAmount === 0) {
    data.status = 'unpaid'
  }

  return data
}
