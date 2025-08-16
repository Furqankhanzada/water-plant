import { getPayload } from 'payload'
import { format } from 'date-fns'
import configPromise from '@payload-config'

import { isWhatsAppEnabled, sendInvoiceTemplate } from '@/lib/sendWhatsAppMessage'
import { Customer } from '@/payload-types'

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isWhatsAppEnabled()) Response.json({ message: 'WhatsApp is not enabled!' })

  const payload = await getPayload({
    config: configPromise,
  })

  const invoice = await payload.findByID({
    collection: 'invoice',
    id: (await params).id,
  })

  if (invoice.sent) {
    return Response.json({
      message: 'According to invoice record, you have alredy sent the invoice',
    })
  }

  if (invoice.status === 'paid') {
    return Response.json({
      message: 'Invoice already paid.',
    })
  }

  const customer = invoice.customer.id as Customer
  const whatsAppContact = customer.contactNumbers?.find(
    (contactNumber) => contactNumber.type === 'whatsapp',
  )
  if (!whatsAppContact?.contactNumber)
    return Response.json({ message: 'No WhatsApp Number Found In Customer' })

  await sendInvoiceTemplate({
    invoice: invoice,
    to: whatsAppContact.contactNumber.replace('+', ''),
    parameters: [
      {
        type: 'text',
        text: customer.name,
      },
      {
        type: 'text',
        text: rupee.format(invoice.dueAmount!),
      },
      {
        type: 'text',
        text: format(invoice.dueAt, 'EEE, MMM dd, yyyy'),
      },
    ],
  })

  await payload.update({
    collection: 'invoice',
    id: invoice.id,
    data: {
      sent: true,
    },
  })

  return Response.json({ message: 'Successfully Sent!' })
}
