import { Invoice } from '@/payload-types'
import type { CollectionBeforeChangeHook } from 'payload'

export const populateCustomerFieldsHook: CollectionBeforeChangeHook<Invoice> = async ({
  data,
  req: { payload },
}) => {
  // Only run if customer is provided
  if (!data.customer) {
    return data
  }

  try {
    // Fetch customer data to get area and block
    const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 0,
      select: {
        area: true,
        block: true,
      },
    })
    // Populate area and block from customer
    data.area = customer.area
    data.block = customer.block
  } catch (error) {
    // Log error but don't fail the operation
    console.error('Error populating customer fields:', error)
  }

  return data
}
