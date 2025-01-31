import type { CollectionConfig } from 'payload'

import { changeTransactionsStatusHook } from '@/hooks/invoices/changeTransactionsStatus'
import { calculateAmountsHook } from '@/hooks/invoices/calculateAmounts'
import { changeTransactionsStatusOnRemoval } from '@/hooks/invoices/changeTransactionsStatusOnRemoval'

export const Invoice: CollectionConfig = {
  slug: 'invoice',
  hooks: {
    afterOperation: [changeTransactionsStatusHook],
    beforeChange: [calculateAmountsHook, changeTransactionsStatusOnRemoval],
  },
  admin: {
    defaultColumns: ['customer', 'status', 'dueAmount', 'paidAmount', 'createdAt', 'pdf'],
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
      defaultValue: 0,
    },
    {
      name: 'previousBalance',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Previous months balance',
      },
    },
    {
      name: 'dueAmount',
      type: 'number',
      label: 'Due Amount',
      admin: {
        readOnly: true, // Read-only field in admin
      },
    },
    {
      name: 'pdf',
      label: 'PDF Invoice',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/Invoices#GeneratePdfButton',
          Cell: {
            path: '/components/Invoices',
            exportName: 'GeneratePdfButton',
            serverProps: { cell: true },
          },
        },
      },
    },
  ],
}
