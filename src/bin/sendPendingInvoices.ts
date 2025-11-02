import type { SanitizedConfig } from 'payload'

import payload from 'payload'

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
  await payload.init({ config })
  console.log('### sendInvoices ###')
  // Queue the send pending invoices task
   await payload.jobs.queue({
    task: 'sendPendingInvoices',
    input: {},
  })

  // Excute all the the queue
  await payload.jobs.run()
  process.exit(0)   
}
