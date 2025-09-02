import { Sale } from '@/payload-types'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * 🔄 Hook: setCounterStatus (Before Change)
 *
 * This hook runs before creating or updating a Sale. It automatically sets
 * the status to 'paid' when the channel is 'counter', since counter sales
 * are typically paid immediately at the point of sale.
 */

export const setCounterStatus: CollectionBeforeChangeHook<Sale> = async ({
  data,
}) => {
  // If channel is counter, automatically set status to paid
  if (data.channel === 'counter') {
    data.status = 'paid'
  }

  return data
}
