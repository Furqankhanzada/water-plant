import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Customer } from '@/payload-types'
import { sendInvoice } from '@/services/whatsapp'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  // if (!isWhatsAppEnabled()) Response.json({ message: 'WhatsApp is not enabled!' })

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

  const customer = invoice.customer as Customer
  const whatsAppContact = customer.contactNumbers?.find(
    (contactNumber) => contactNumber.type === 'whatsapp',
  )
  if (!whatsAppContact?.contactNumber)
    return Response.json({ message: 'No WhatsApp Number Found In Customer' })

  const client = await payload.findGlobal({ slug: 'whatsapp' })

  const message = await sendInvoice(invoice, whatsAppContact.contactNumber, client.id)

  if (!message.success) {
    return Response.json({ message: 'Failed to send invoice', data: message })
  }

  await payload.update({
    collection: 'invoice',
    id: invoice.id,
    data: {
      sent: true,
    },
  })

  return Response.json({ message: 'Successfully Sent!', data: message })
}
