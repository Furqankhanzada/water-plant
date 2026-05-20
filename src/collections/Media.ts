import type { CollectionConfig } from 'payload'

import { isAdmin } from './access/isAdmin'
import { tenantField } from '@/collections/Tenants/helpers'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    tenantField,
  ],
  upload: {
    disableLocalStorage: true,
  },
}
