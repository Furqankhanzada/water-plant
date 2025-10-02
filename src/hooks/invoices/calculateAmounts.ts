import { Customer, Invoice } from '@/payload-types'
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

export const calculateAmountsHook: CollectionBeforeChangeHook<Invoice> = async ({
  data,
  originalDoc,
  req: { payload },
}) => {
  const transactionIds = data.transactions
    ?.filter((t) => t.relationTo === 'transaction')
    .map((t) => t.value)
  const salesIds = data.transactions?.filter((t) => t.relationTo === 'sales').map((t) => t.value)

  const transactions = await payload.find({
    collection: 'transaction',
    where: {
      id: {
        in: transactionIds,
      },
    },
    pagination: false,
    depth: 0
  })

  const sales = await payload.find({
    collection: 'sales',
    where: {
      id: {
        in: salesIds,
      },
    },
    pagination: false,
    depth: 0
  })

  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      customer: {
        contains: data.customer,
      },
      id: {
        not_equals: originalDoc?.id,
      },
      dueAt: {
        less_than: data.dueAt,
      },
    },
    limit: 1,
    sort: '-dueAt',
    depth: 1,
    select: {
      customer: true,
      advanceAmount: true,
      remainingAmount: true,
      totals: true,
    },
    populate: {
      customers: {
        balance: true
      }
    },
    pagination: false,
  })

  let previous = 0
  let paid = 0;
  let other = 0;
  if (invoices.docs.length) {
    const previousInvoice = invoices.docs[0]
    previous = (previousInvoice.totals?.balance || 0)
  } else {
    const customer = await payload.findByID({ 
      collection: 'customers',
      id: data.customer as string,
      depth: 0,
      select: {
        balance: true
      }
    })
    previous = customer.balance || 0
  }

  // Calculate transactions total from multiple transactions
  const transactionsTotalAmount = transactions.docs.reduce((sum, transaction) => {
    return sum + transaction.total
  }, 0)

  // Calculate transactions total from multiple transactions
  const salesTotalAmount = sales.docs.reduce((sum, sale) => {
    return sum + (sale.totals?.gross || 0)
  }, 0)

  if (data.lost?.count && data.lost?.amount) {
    data.lost.total = data.lost?.count * data.lost?.amount
    other = data.lost.total
  } else if (data.lost?.total) {
    data.lost.total = 0
  }

  if (data.payments) {
    paid = data.payments.reduce((sum: number, payment: { amount: number }) => {
      return sum + payment.amount
    }, 0)
  }

  const subtotal = transactionsTotalAmount + salesTotalAmount;
  const net = subtotal - (data.totals?.discount || 0);
  const total = net + previous + (data.totals?.tax || 0) + other;

  data.totals = {
    ...data.totals,
    subtotal,
    net, 
    previous,
    other,
    total,
    paid,
    balance: total - paid
  }

  // Set status based on due amount and paid amount
  if (data.totals.paid! === data.totals.total! || data.totals.paid! > data.totals.total!) {
    data.status = 'paid'
  } else if (data.totals.paid! > 0 && data.totals.paid! < data.totals.total!) {
    data.status = 'partially-paid'
  } else if (data.totals.paid === 0) {
    data.status = 'unpaid'
  }

  return data
}
