import type { CollectionConfig } from 'payload'

import { afterOperationHook } from '@/hooks/invoices'
import { calculateDueAmountHook } from '@/hooks/invoices/calculateAmount'

export const Invoice: CollectionConfig = {
  slug: 'invoice',
  hooks: {
    afterOperation: [afterOperationHook],
    beforeChange: [calculateDueAmountHook],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'transactions',
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
      validate: () => true,
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
      defaultValue: 'unpaid',
      admin: {
        description: 'Set the status to In Progress or Complete.',
        readOnly: true,
      },
    },
    {
      name: 'paidAmount',
      type: 'number',
      label: 'Paid Amount',
      required: true,
    },
    {
      name: 'dueAmount',
      type: 'number',
      label: 'Due Amount',
      admin: {
        readOnly: true, // Read-only field in admin
      },
    },
  ],
}
