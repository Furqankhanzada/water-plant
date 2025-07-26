import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from './access/isAdmin'
import { isAdminOrSelf } from './access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  auth: {
    useAPIKey: true,
    useSessions: false,
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      saveToJWT: true,
      hasMany: true,
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
    },
  ],
}
