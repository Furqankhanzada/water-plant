import type { CollectionAfterOperationHook } from 'payload'

export const afterOperationHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  if (operation === 'create' || operation === 'update') {
  }
  return result
}
