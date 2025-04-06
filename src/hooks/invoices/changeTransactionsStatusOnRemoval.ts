import type { CollectionBeforeChangeHook } from 'payload'

export const changeTransactionsStatusOnRemoval: CollectionBeforeChangeHook = async ({
  req: { payload },
  operation,
  data,
  originalDoc,
}) => {
  if (operation !== 'update') return data

  // If the transactions array is not present in the original document, make empty array
  originalDoc.transactions = originalDoc.transactions || []

  if (originalDoc.transactions.length) {
    const deletedTransactions = originalDoc.transactions.filter(
      (otId: string) => !data.transactions.includes(otId),
    )

    if (deletedTransactions.length) {
      await payload.update({
        collection: 'transaction',
        where: {
          id: {
            in: deletedTransactions,
          },
        },
        data: {
          status: 'unpaid',
        },
      })
    }
  }

  return data
}
