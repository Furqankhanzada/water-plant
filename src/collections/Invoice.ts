import type { CollectionConfig } from 'payload'

export const Invoice: CollectionConfig = {
  slug: 'invoice',
  admin: {},
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },

    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transaction',
      hasMany: true,
      required: true,
      filterOptions: ({ data }) => {
        return {
          customer: { equals: data.customer },
          status: { equals: 'unpaid' },
        }
      },
    },
    {
      name: 'status',
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
        {
          label: 'Partially Paid',
          value: 'partially-paid',
        },
      ],

      defaultValue: 'inprogress',
      admin: {
        description: 'Set the status to In Progress or Complete.',
      },
    },
    {
      name: 'transactionAt',
      type: 'join',
      on: 'invoice',
      collection: 'transaction',
    },
  ],
}
