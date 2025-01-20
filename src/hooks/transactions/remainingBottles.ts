import type { CollectionBeforeChangeHook } from 'payload'

export const calculateRemainingBottles: CollectionBeforeChangeHook = async ({
  data,
  req: { payload },
}) => {
  const customer = await payload.findByID({
    collection: 'customers',
    id: data.customer,
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
        equals: data.customer,
      },
    },
    select: {
      customer: true,
      remainingBottles: true,
    },
  })

  if (!transactions.docs.length) {
    data.remainingBottles = customer.bottlesAtHome + data.bottleGiven - data.bottleTaken
  } else {
    data.remainingBottles =
      transactions.docs[0].remainingBottles + data.bottleGiven - data.bottleTaken
  }

  return data
}
