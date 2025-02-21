import { CollectionConfig } from 'payload'

export const Requests: CollectionConfig = {
  slug: 'requests',
  admin: {
    defaultColumns: ['from', 'phone', 'date', 'fulfilled'],
  },
  fields: [
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
    },
    {
      label: 'New Customer/Number not in Customer Record',
      name: 'phone',
      type: 'text',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'fulfilled',
      label: 'Water Delivery Request Fulfilled?',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
