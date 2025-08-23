import type { CollectionConfig } from 'payload'

export const Sales: CollectionConfig = {
  slug: 'sales',
  admin: {
  },
  access: {
  },
  fields: [
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Counter', value: 'counter' },
        { label: 'Refiller', value: 'refiller' },
        { label: 'Retail Bottles', value: 'retail_bottles' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        condition: (data) => data.channel !== 'counter',
      },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'Paid',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid', value: 'partially_paid' },
      ],
    },
    {
      name: 'payments',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'cash',
          options: [
            { label: 'Cash', value: 'cash' },
            { label: 'Online', value: 'online' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
        },
        {
          name: 'paidAt',
          type: 'date',
          required: true,
          defaultValue: new Date(),
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },

  ],
}
