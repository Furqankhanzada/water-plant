import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type NextRequest } from 'next/server'

import { getInvoiceCaption, sendInvoice, sendMessage } from '@/lib/sendWhatsAppMessage'
import { Invoice } from '@/payload-types'

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
              or: [
                {
                  from: {
                    in: customers.docs.map((c) => c.id),
                  },
                },
                {
                  'messages.fullMessage.from': {
                    equals: message.from,
                  },
                },
              ],
            },
          })
          if (messages.docs.length) {
            payload.update({
              collection: 'messages',
              where: {
                or: [
                  {
                    from: {
                      in: customers.docs.map((c) => c.id),
                    },
                  },
                  {
                    'messages.fullMessage.from': {
                      equals: message.from,
                    },
                  },
                ],
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

          let greeting = 'Dear Customer,\n'
          if (customers.docs && customers.docs.length) {
            const customer = customers.docs[0]
            greeting = `Dear *${customer.name}*,\n`
          }

          const generalMessage = `Your number is not registered in our system. Our representative will call you for further information. In the meantime, please WhatsApp us at +923151114778.
          
آپ کا نمبر ہمارے رکارڈ میں موجود نہیں ہے۔ ہمارا نمائیندہ جلد آپ سے رابطہ کرے گا، فلحال آپ اس نمبر پر رابطہ کر سکتے ہیں 03151114778
          `
          let messageSent
          switch (message?.text.body.trim()) {
            case '1':
            case 'Last Month Invoice/Bill':
            case '/invoice':
              if (customers.docs.length) {
                const customer = customers.docs[0]
                if (customer.invoice?.docs && customer.invoice.docs.length) {
                  const invoice = customer.invoice.docs[0] as Invoice
                  messageSent = await sendInvoice({
                    invoice,
                    to: message.from,
                    caption: getInvoiceCaption(invoice),
                  })
                }
              } else {
                messageSent = await sendMessage({
                  to: message.from,
                  text: {
                    body: generalMessage,
                  },
                })
              }
              break
            case '2':
            case 'Request Water Delivery':
            case '/delivery':
              // Store Requests to DB
              const requests = await payload.find({
                collection: 'requests',
                where: {
                  or: [
                    {
                      from: {
                        in: customers.docs.map((c) => c.id),
                      },
                    },
                    {
                      phone: {
                        in: message.from,
                      },
                    },
                  ],
                  fulfilled: {
                    not_equals: true,
                  },
                },
              })
              if (requests.docs.length) {
                messageSent = await sendMessage({
                  to: message.from,
                  text: {
                    body: `You have already requested for water delivery, We will try to deliver as soon as possible.`,
                  },
                })
              } else {
                await payload.create({
                  collection: 'requests',
                  data: {
                    from: customers.docs.map((c) => c.id),
                    phone: message.from,
                    date: new Date().toISOString(),
                  },
                })
                messageSent = await sendMessage({
                  to: message.from,
                  text: {
                    body: `We have received you request, We will try to deliver as soon as possible. `,
                  },
                })
              }

              break
            default:
              const initialMessage = `\nI'm a *Bot*, created by Labbaik Drinking Water exclusively for it's customers.

Feel free to ask me:
                
1️⃣ *Last month bill* (*پچھلے مہینے کا بل*)
2️⃣ *Water Delivery* (*پانی چاہیے*)
                          
The bot is under development so for now contact us on +923151114778`
              messageSent = await sendMessage({
                to: message.from,
                text: {
                  body: `${greeting}${initialMessage}`,
                },
              })
              break
          }

          const data = await messageSent?.json()

          if (!messageSent?.ok) {
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
