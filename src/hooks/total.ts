import type { CollectionAfterChangeHook } from 'payload'

export const afterTotalChangeHook: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation === 'create' || operation === 'update') {
    const customer = await payload.findByID({
      collection: 'customers',
      id: doc.customer,
      select: {
        rate: true,
      },
    })

    const rate = customer ? customer.rate : 0

    doc.total = doc.bottleGiven * rate

    await payload.update({
      collection: 'transaction',
      where: {
        id: {
          equals: doc.id,
        },
      },
      data: {
        total: doc.total, 
      },
    })
  }

  return doc
}
