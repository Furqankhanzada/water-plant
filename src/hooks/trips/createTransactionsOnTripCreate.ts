import type { CollectionAfterOperationHook } from 'payload';
import { Trip } from '@/payload-types';
import { generateTripCustomers, insertCustomersTransactions } from './utils';


export const createTransactionsOnTripCreate: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  const tripResult = result as Trip
  if (operation === 'create') {
    const tripCustomers = await generateTripCustomers(tripResult, req.payload);
    await insertCustomersTransactions(tripCustomers, tripResult, req.payload);
  }
  return result
}
