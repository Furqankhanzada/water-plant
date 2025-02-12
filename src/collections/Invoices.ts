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
    defaultColumns: [
      'customer',
      'status',
      'dueAmount',
      'paidAmount',
      'dueAt',
      'paidAt',
      'sent',
      'pdf',
    ],
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
      name: 'netTotal',
      type: 'number',
      label: 'Net Total',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'previousBalance',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Previous months balance which customer needs to pay.',
      },
    },
    {
      name: 'previousAdvanceAmount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Customer paid more then invoice amount in previous month which will be adjust on this invoice.',
        readOnly: true,
      },
    },
    {
      name: 'dueAmount',
      type: 'number',
      label: 'Due Amount',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'paidAmount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'advanceAmount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Customer paid more then invoice amount which will be adjust on next billig/invoice.',
        readOnly: true,
      },
    },
    {
      name: 'remainingAmount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Customer needs to pay this amount to clear billig/invoice.',
        readOnly: true,
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'dueAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      label: 'Invoice Sent to Customer?',
      name: 'sent',
      type: 'checkbox',
      defaultValue: false,
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
