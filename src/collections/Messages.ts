import { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    defaultColumns: ['from', 'messages', 'read'],
  },
  access: {
    create: () => false,
  },
  fields: [
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
    },
    {
      name: 'read',
      label: 'You have read the message and proper action taken?',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'fullMessage',
          type: 'json',
        },
      ],
    },
  ],
}
