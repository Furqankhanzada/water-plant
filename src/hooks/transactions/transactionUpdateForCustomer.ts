import { format } from 'date-fns'
import type { CollectionBeforeChangeHook } from 'payload'
import inlineCSS from 'inline-css'

import { getHandlebarsTemplate } from '@/lib/getHandlebarsTemplate'

export const transactionUpdateForCustomer: CollectionBeforeChangeHook = async ({
  data,
  req: { payload, headers },
}) => {
  if (data.bottleGiven > 0 || data.bottleTaken > 0) {
    const customer = await payload.findByID({
      collection: 'customers',
      id: data.customer,
      select: {
        email: true,
        name: true,
      },
    })
    if (customer.email) {
      const host = headers.get('x-forwarded-host') || headers.get('url')
      const protocol = headers.get('x-forwarded-proto') || 'https'

      const fullUrl = `${protocol}://${host}`
      const html = await inlineCSS(
        getHandlebarsTemplate('transaction')({
          bottleGiven: data.bottleGiven,
          bottleTaken: data.bottleTaken,
          date: format(data.transactionAt, 'EEE, MMM dd yyyy'),
          customer: customer.name,
          image: fullUrl + '/api/media/file/ad.jpg',
        }),
        {
          url: ' ',
          removeStyleTags: false,
        },
      )
      payload.sendEmail({
        to: customer.email,
        subject: `Water Bottls Delivery - ${format(data.transactionAt, 'EEE, MMM dd	yyyy')}`,
        html,
      })
    }
  }
  return data
}
