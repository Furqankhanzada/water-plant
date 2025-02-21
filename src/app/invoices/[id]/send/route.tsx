import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { sendInvoice } from '@/lib/sendWhatsAppMessage'
import { Customer } from '@/payload-types'

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
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

  let caption
  switch (invoice.status) {
    case 'unpaid':
      caption = `Dear customer,\nYour Invoice for the current month is attached and total dues are *${rupee.format(invoice.dueAmount!)}*/-.`
      break
    case 'partially-paid':
      caption = `Dear customer,\nYour Invoice for the current month is attached and remaining dues are *${rupee.format(invoice.dueAmount!)}*/-.`
      break
  }

  await sendInvoice({
    invoice: invoice,
    to: whatsAppContact.contactNumber.replace('+', ''),
    caption,
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
