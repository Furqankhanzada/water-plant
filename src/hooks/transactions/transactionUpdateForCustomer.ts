import { format } from 'date-fns'
import type { CollectionBeforeChangeHook } from 'payload'

export const transactionUpdateForCustomer: CollectionBeforeChangeHook = async ({
  data,
  req: { payload },
}) => {
  if (data.bottleGiven > 0 || data.bottleTaken > 0) {
    const customer = await payload.findByID({
      collection: 'customers',
      id: data.customer,
      select: {
        email: true,
      },
    })
    if (customer.email) {
      console.info(`email sending to ${customer.email}`)
      payload.sendEmail({
        to: customer.email,
        subject: `Water Bottls Delivery - ${format(data.transactionAt, 'EEE, MMM dd	yyyy')}`,
        text: `We have delivered ${data.bottleGiven} bottles and you returned ${data.bottleTaken} bottles on date ${format(data.transactionAt, 'EEE, MMM dd	yyyy')}`,
      })
    }
  }
  return data
}
