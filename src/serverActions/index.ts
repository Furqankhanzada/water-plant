'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const fetchWhatsAppGlobalDocument = async () => {
  const payload = await getPayload({ config: configPromise })
  return await payload.findGlobal({ slug: 'whatsapp' })
}
