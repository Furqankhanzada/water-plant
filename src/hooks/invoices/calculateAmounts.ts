import type { CollectionBeforeChangeHook } from 'payload'

/**
 * 🔄 Hook: calculateAmountsHook (Before Change)
 *
 * This hook runs before creating or updating an Invoice. It performs the following:
 *
 * 1. 📦 Fetches the related transactions selected for this invoice and calculates the total amount.
 * 2. 🧾 Looks up the most recent invoice for the same customer (excluding the current one)
 *    where the due date is less than the current invoice's due date. This gives us:
 *      - previous remaining balance
 *      - previous advance amount
 *    These are used to compute the carry-forward balances.
 *
 * 3. 💰 Calculates financial fields:
 *    - `netTotal`: total from all related transactions
 *    - `paidAmount`: total from payments (if any)
 *    - `dueAmount`: total due considering previous balances
 *    - `remainingAmount`: unpaid portion
 *    - `advanceAmount`: excess amount paid
 *
 * 4. 🧮 Adjusts for lost bottles if applicable, by increasing `dueAmount`.
 *
 * 5. 🟢 Sets the `status` of the invoice based on payment state:
 *    - `paid`: fully paid
 *    - `partially-paid`: partially paid
 *    - `unpaid`: no payments made
 *
 * This hook ensures invoice financial calculations remain consistent and
 * reflect historical balances and real-time payments and losses.
 */

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

  if (data.payments) {
    data.paidAmount = data.payments.reduce((sum: number, payment: { amount: number }) => {
      return sum + payment.amount
    }, 0)
  }

  // Calculate due amount
  data.netTotal = totalAmount
  data.dueAmount = data.netTotal + (data.previousBalance || data.previousAdvanceAmount)
  data.remainingAmount = data.dueAmount - data.paidAmount > 0 ? data.dueAmount - data.paidAmount : 0
  data.advanceAmount = data.dueAmount - data.paidAmount < 0 ? data.dueAmount - data.paidAmount : 0

  if (data.lostBottlesCount && data.lostBottleAmount) {
    data.lostBottlesTotalAmount = data.lostBottlesCount * data.lostBottleAmount
    data.dueAmount += data.lostBottlesTotalAmount
  } else if (data.lostBottlesTotalAmount) {
    data.lostBottlesTotalAmount = 0
  }

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
