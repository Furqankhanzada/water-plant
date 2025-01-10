import type { CollectionBeforeChangeHook } from 'payload'

export const calculateTotalHook: CollectionBeforeChangeHook = async ({
  data,
  req: { payload },
}) => {
  const customer = await payload.findByID({
    collection: 'customers',
    id: data.customer,
    select: {
      rate: true,
    },
  })
  data.total = data.bottleGiven * customer.rate
  return data
}
