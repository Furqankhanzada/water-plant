import { type CollectionBeforeChangeHook, APIError } from 'payload'

export const calculateRemainingBottles: CollectionBeforeChangeHook = async ({
  data,
  req: { payload },
}) => {
  const transactions = await payload.find({
    collection: 'transaction',
    limit: 1,
    sort: '-transactionAt',
    where: {
      customer: {
        equals: data.customer,
      },
      transactionAt: {
        less_than: data.transactionAt,
      },
    },
    depth: 1,
    select: {
      transactionAt: true,
      remainingBottles: true,
    },
  })

  let previousRemaining: number

  if (!transactions.docs.length) {
    // First transaction for this customer - use customer's initial bottles as zero
    previousRemaining = 0
  } else {
    // Use remaining bottles from the most recent transaction
    previousRemaining = transactions.docs[0].remainingBottles || 0
  }

  // Validation: Cannot take more bottles than the customer has
  if (data.bottleTaken > previousRemaining) {
    throw new APIError(
      `Invalid transaction: Cannot take ${data.bottleTaken} bottles; customer only has ${previousRemaining} available.`,
      400,
      undefined,
      false, // admin-only error detail
    )
  }

  // Calculate remaining bottles
  data.remainingBottles = previousRemaining + data.bottleGiven - data.bottleTaken

  // Additional validation: Remaining bottles cannot be negative
  if (data.remainingBottles < 0) {
    throw new APIError(`Invalid transaction: This would result would be ${data.remainingBottles}`, 400, undefined, false)
  }

  return data
}
