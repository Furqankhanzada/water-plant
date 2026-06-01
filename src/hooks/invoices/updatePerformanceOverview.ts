import { Invoice } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'

export const updatePerformanceOverview: CollectionAfterChangeHook<Invoice> = async ({
  doc,
  req,
}) => {
  if (req.context.disablePerformanceOverview) {
    return doc
  }

  const job = await req.payload.jobs.queue({
    task: 'updatePerformanceOverview',
    input: {},
  })

  await req.payload.jobs.runByID({ id: job.id })

  return doc;
}
