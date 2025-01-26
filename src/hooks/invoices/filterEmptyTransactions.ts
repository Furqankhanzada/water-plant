import { CollectionAfterReadHook } from "payload"


interface TransactionDetail {
  id: string;
  trip: string;
  customer: string;
  status: string
  bottleGiven: number;
  bottleTaken: number;
  transactionAt: string;
  remainingBottles: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const filterEmptyTransactions: CollectionAfterReadHook = async ({ doc  } ) => {
    if (doc && doc.transaction && Array.isArray(doc.transaction.docs)) {
      doc.transaction.docs = doc.transaction.docs.filter((transaction: TransactionDetail) => {
        return transaction.bottleGiven !== 0 || transaction.bottleTaken !== 0
      })
    }
    return doc
  }