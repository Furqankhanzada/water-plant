import type { TaskConfig } from 'payload'
import { Customer } from '@/payload-types'
import { sendInvoice } from '@/services/whatsapp'
import { startOfMonth } from 'date-fns'

/**
 * Generate random delay up to 1 minute (0 to 60,000ms)
 * Helps avoid WhatsApp rate limiting when using Puppeteer
 */
const getRandomDelay = (): number => {
  const maxMs = 60 * 1000 // 1 minute
  return Math.floor(Math.random() * (maxMs + 1))
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Task: sendPendingInvoices
 * 
 * Gets one latest invoice that hasn't been sent (sent: false)
 * and sends it via WhatsApp if the customer has a WhatsApp number.
 * Processes one invoice at a time with random delays to avoid WhatsApp rate limiting.
 */
export const sendPendingInvoicesTask: TaskConfig<'sendPendingInvoices'> = {
  slug: 'sendPendingInvoices',
  inputSchema: [],
  handler: async ({ req }) => {
    try {
      // Calculate start of current month
      const monthStart = startOfMonth(new Date())

      // Use MongoDB aggregation to find invoices where customer has WhatsApp contact
      const result = await req.payload.db.collections['invoice'].aggregate([
        // Match pending, latest, unpaid invoices created at start of month
        {
          $match: {
            sent: false,
            status: { $ne: 'paid' },
            createdAt: { $gte: monthStart },
            isLatest: true,
          },
        },
        // Sort by newest first
        { $sort: { createdAt: -1 } },
        // Lookup customer
        {
          $lookup: {
            from: 'customers',
            localField: 'customer',
            foreignField: '_id',
            as: 'customer',
          },
        },
        // Unwind customer array
        { $unwind: '$customer' },
        // Filter to only customers with WhatsApp contact
        {
          $match: {
            'customer.contactNumbers': {
              $elemMatch: {
                type: 'whatsapp',
                contactNumber: { $exists: true, $ne: null },
              },
            },
          },
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
          },
        },
        { $limit: 1 },
      ])

      const invoice = result[0]
      if (!invoice) {
        return { output: {} }
      }

      const customer = invoice.customer as Customer
      const whatsAppContact = customer.contactNumbers?.find(
        (contactNumber: any) => contactNumber.type === 'whatsapp'
      )

      if (!whatsAppContact) {
        return { output: {} }
      }

      // Random delay between 1-2 minutes before sending to avoid WhatsApp rate limiting
      const delayMs = getRandomDelay()
      await delay(delayMs)

      // Send invoice via WhatsApp
      const client = await req.payload.findGlobal({ slug: 'whatsapp' })
      const message = await sendInvoice(invoice, whatsAppContact.contactNumber, client.id)

      console.log('### message ###', message)

      if(message.success) {
        await req.payload.update({
          collection: 'invoice',
          id: invoice.id,
          data: {
            sent: true,
          },
        })
      }
      return { output: {} }
    } catch (error) {
      console.error('### error ###', error)
      throw error
    }
  },
}

