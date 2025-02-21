import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type NextRequest } from 'next/server'

import { sendMessage, uploadMedia } from '@/lib/sendWhatsAppMessage'
import { Invoice } from '@/payload-types'
import { format } from 'date-fns'

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const challenge = searchParams.get('hub.challenge')
  const verifyToken = searchParams.get('hub.verify_token')

  if (mode === 'subscribe' && verifyToken === process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN) {
    return new Response(challenge)
  }
  return Response.json({ message: 'Verification failed' })
}

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export async function POST(request: Request) {
  const res = await request.json()
  console.log('POST: ', res)
  for (const e of res.entry) {
    for (const change of e.changes) {
      console.log('change', change)

      if (change.value.statuses) {
        for (const status of change.value.statuses) {
          console.log('change status: ', status.status)
        }
      }

      //   console.log('change field', change.field)
      //   console.log('change metadata', change.value.metadata)
      //   console.log('change contacts', change.value.contacts)
      if (!change.value.messages) continue
      for (const message of change.value.messages) {
        console.log('message: ', message)

        // Read message so user can see blue tick
        sendMessage({
          status: 'read',
          message_id: message.id,
        })

        try {
          const payload = await getPayload({
            config: configPromise,
          })

          const customers = await payload.find({
            collection: 'customers',
            where: {
              'contactNumbers.contactNumber': {
                equals: `+${message.from}`,
              },
            },
            joins: {
              invoice: {
                limit: 1,
                sort: '-dueAt',
              },
            },
          })
          // Store Messages to DB
          const messages = await payload.find({
            collection: 'messages',
            where: {
              from: {
                in: customers.docs.map((c) => c.id),
              },
            },
          })
          if (messages.docs.length) {
            payload.update({
              collection: 'messages',
              where: {
                from: {
                  in: customers.docs.map((c) => c.id),
                },
              },
              data: {
                from: customers.docs.map((c) => c.id),
                messages: [{ fullMessage: message }, ...messages.docs[0].messages],
              },
            })
          } else {
            payload.create({
              collection: 'messages',
              data: {
                from: customers.docs.map((c) => c.id),
                messages: [{ fullMessage: message }],
              },
            })
          }

          let greeting = 'Hello, \n'
          let invoiceMessage = ''
          if (customers.docs && customers.docs.length) {
            const customer = customers.docs[0]
            greeting = `Hello *${customer.name}*,\n`
            if (customer.invoice?.docs && customer.invoice.docs.length) {
              const invoice = customer.invoice.docs[0] as Invoice
              switch (invoice.status) {
                case 'paid':
                  invoiceMessage = `\nYour last invoice is *Paid*, Thank you for paying it on time.`
                  break
                case 'unpaid':
                  invoiceMessage = `\nYour last invoice is *UNPAID*, and your due amount is *${rupee.format(invoice.dueAmount!)}*.`
                  break
                case 'partially-paid':
                  invoiceMessage = `\nYour last invoice is *Partially Paid*, and your remaining due amount is *${rupee.format(invoice.remainingAmount!)}*.`
                  break
              }
              const mediaId = await uploadMedia(`${process.env.URL}/invoices/${invoice.id}/pdf`)
              await sendMessage({
                to: message.from,
                type: 'document',
                document: {
                  id: mediaId,
                  filename: `${format(invoice.dueAt, 'MMMM')}-Invoice.pdf`,
                },
              })
            }
          }
          const messageSent = await sendMessage({
            to: message.from,
            text: {
              body: `${greeting}${invoiceMessage}`,
            },
          })

          const data = await messageSent.json()

          if (!messageSent.ok) {
            throw new Error(data.error?.message || 'Failed to send message')
          }

          return Response.json({ success: true, data })
        } catch (error) {
          console.log('catch Error: ', error)
        }
      }
    }
  }

  return new Response('Something happend')
}
