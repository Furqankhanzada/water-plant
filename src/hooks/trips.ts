import type { CollectionAfterOperationHook } from 'payload'

export const afterOperationHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  if (operation === 'create') {
    const customers = req.payload.find({
      collection: 'customers',
      where: {
        area: {
          equals: result.areas,
        },
      },
    })

    req.payload.create({
      collection: 'transaction',
      data: {
        trip: result.id,
      },
    })
  }
  return result
}
