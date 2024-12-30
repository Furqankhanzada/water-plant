import type { CollectionConfig } from 'payload'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  fields: [
    {
      name: 'trips',
      type: 'relationship',
      relationTo: 'trips',
      required: true,
    },
    {
      name: 'customers',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'employee',
      label: 'Delivered by',
      type: 'relationship',
      relationTo: 'employee',
      required: true,
    },

    {
      name: 'status',
      label: 'Transaction Status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Paid',
          value: 'paid',
        },
        {
          label: 'Unpaid',
          value: 'unpaid',
        },
      ],
    },
    {
      name: 'bottleGiven',
      type: 'number',
      required: true,
      admin: {
        placeholder: 'Enter the number of bottles given',
      },
    },

    {
      name: 'bottleTaken',
      type: 'number',
      required: true,
      admin: {
        placeholder: 'Enter the number of bottles taken',
      },
    },
  ],
}
