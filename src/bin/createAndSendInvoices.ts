import { generateAndSendInvoices } from '@/scripts/generateAndSendInvoices'
import type { SanitizedConfig } from 'payload'

import payload from 'payload'

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
  await payload.init({ config })
  await generateAndSendInvoices(payload)
  payload.logger.info('Successfully created and sent invoices!')
  process.exit(0)
}