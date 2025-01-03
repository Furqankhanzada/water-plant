import type { CollectionAfterChangeHook } from 'payload'

export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation === 'create') return doc

  const customer = await payload.findByID({
    collection: 'customers',
    id: doc.customer,
    select: {
      bottlesAtHome: true,
    },
  })

  const transactions = await payload.find({
    collection: 'transaction',
    limit: 1,
    sort: '-transactionAt',
    where: {
      customer: {
        equals: doc.customer,
      },
      id: {
        not_equals: doc.id,
      },
    },
    select: {
      customer: true,
      remainingBottles: true,
    },
  })

  if (!transactions.docs.length) {
    doc.remainingBottles = customer.bottlesAtHome + doc.bottleGiven - doc.bottleTaken
  } else {
    doc.remainingBottles = transactions.docs[0].remainingBottles + doc.bottleGiven - doc.bottleTaken
  }

  payload.update({
    collection: 'transaction',
    where: {
      id: {
        equals: doc.id,
      },
    },
    data: {
      remainingBottles: doc.remainingBottles,
    },
  })

  return doc
}
