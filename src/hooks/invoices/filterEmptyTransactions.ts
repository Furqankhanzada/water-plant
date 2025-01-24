import { CollectionAfterReadHook } from "payload"
export const filterEmptyTransactions: CollectionAfterReadHook = async ({ doc  } ) => {
    if (doc && doc.transaction && Array.isArray(doc.transaction.docs)) {
      doc.transaction.docs = doc.transaction.docs.filter((transaction: any) => {
        return transaction.bottleGiven !== 0 || transaction.bottleTaken !== 0
      })
    }
    return doc
  }