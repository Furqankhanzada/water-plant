import { BasePayload, getPayload } from 'payload'
import { endOfMonth, format, isSameMonth, setDate, startOfMonth, subMonths } from 'date-fns'
import configPromise from '@payload-config'

import { Transaction, Customer, Invoice, Sale } from '@/payload-types'
import { isWhatsAppEnabled, sendInvoiceTemplate } from '@/lib/sendWhatsAppMessage'

const getLastMonthTransactions = async (payload: BasePayload, customerId: string) => {
  const currentDate = new Date()
  const transactions = await payload.find({
    collection: 'transaction',
    pagination: false,
    sort: 'transactionAt',
    where: {
      customer: {
        equals: customerId,
      },
      status: {
        equals: 'unpaid',
      },
      and: [
        {
          transactionAt: {
            greater_than_equal: startOfMonth(subMonths(currentDate, 1)),
          },
        },
        {
          transactionAt: {
            less_than_equal: endOfMonth(subMonths(currentDate, 1)),
          },
        },
      ],
    },
    depth: 0,
    select: {
      transactionAt: true,
      customer: true,
    },
  })
  return transactions.docs
}

const getLastMonthSales = async (payload: BasePayload, customerId: string) => {
  const currentDate = new Date()
  const sales = await payload.find({
    collection: 'sales',
    pagination: false,
    sort: 'date',
    where: {
      customer: {
        equals: customerId,
      },
      status: {
        equals: 'unpaid',
      },
      and: [
        {
          date: {
            greater_than_equal: startOfMonth(subMonths(currentDate, 1)),
          },
        },
        {
          date: {
            less_than_equal: endOfMonth(subMonths(currentDate, 1)),
          },
        },
      ],
    },
    depth: 0,
    select: {
      date: true,
      customer: true,
    },
  })
  return sales.docs
}

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const createAndSendInvoice = async (
  payload: BasePayload,
  customer: Partial<Customer>,
  transactions: Partial<Transaction>[],
  sales: Partial<Sale>[],
  currentDate: Date
) => {
  // Create the transactions array with proper relationTo structure
  const invoiceTransactions = [
    ...transactions.map((t) => ({ relationTo: 'transaction' as const, value: t.id! })),
    ...sales.map((s) => ({ relationTo: 'sales' as const, value: s.id! }))
  ]

  const newInvoice = await payload.create({
    collection: 'invoice',
    data: {
      customer: customer.id!,
      transactions: invoiceTransactions,
      dueAt: setDate(currentDate, 10).toISOString(),
    },
  })
  
  if (newInvoice.status === 'paid') return
  
  const whatsAppContact = customer?.contactNumbers?.find(
    (contactNumber: any) => contactNumber.type === 'whatsapp',
  )
  let sent = false
  // if customer have whatsapp number
  if (whatsAppContact && isWhatsAppEnabled()) {
    await sendInvoiceTemplate({
      invoice: newInvoice,
      to: whatsAppContact.contactNumber.replace('+', ''),
      parameters: [
        {
          type: 'text',
          text: customer.name!,
        },
        {
          type: 'text',
          text: rupee.format(newInvoice.totals?.total || 0),
        },
        {
          type: 'text',
          text: format(newInvoice.dueAt, 'EEE, MMM dd, yyyy'),
        },
      ],
    })
    sent = true
  }
  // update invoice so that we know that its already sent to customer
  if (sent) {
    payload.update({
      collection: 'invoice',
      id: newInvoice.id,
      data: {
        sent,
      },
    })
  }
}

export const generateAndSendInvoices = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const customers = await payload.find({
    collection: 'customers',
    pagination: false,
    joins: {
      invoice: {
        limit: 1,
        sort: '-dueAt',
      },
    },
    select: {
      name: true,
      invoice: true,
      contactNumbers: true,
      email: true,
      rate: true,
      type: true,
    },
  })

  const currentDate = new Date()
  for (const customer of customers.docs) {
    // Skip customers with zero rate
    if (!customer.rate || customer.rate <= 0) {
      console.log(`Skipping ${customer.name} - zero rate customer`)
      continue
    }

    // Check if customer has existing invoices
    if (customer.invoice?.docs?.length) {
      // Existing customer logic
      const invoice = customer.invoice.docs[0] as Invoice
      // If current month invoice exist then dont do anything
      if (isSameMonth(invoice.dueAt, currentDate)) {
        continue
      }
    }
    
    let transactions: Partial<Transaction>[] = []
    let sales: Partial<Sale>[] = []

    // Generate invoices based on customer type
    if (customer.type === 'delivery' || customer.type === 'refill') {
      // For delivery and refill customers, use transactions
      transactions = await getLastMonthTransactions(payload, customer.id)
      if (!transactions.length) {
        console.log(`Skipping ${customer.name} - no last month transactions`)
        continue
      }
    } else if (customer.type === 'filler' || customer.type === 'shop') {
      // For filler customers, use sales with 'filler' channel
      sales = await getLastMonthSales(payload, customer.id)
      if (!sales.length) {
        console.log(`Skipping ${customer.name} - no last month filler sales`)
        continue
      }
    } else {
      console.log(`Skipping ${customer.name} - unknown customer type: ${customer.type}`)
      continue
    }
    
    await createAndSendInvoice(payload, customer, transactions, sales, currentDate)
    console.log(`completed for ${customer.name} (${customer.type}) - ${customer.id}`)
  }
}