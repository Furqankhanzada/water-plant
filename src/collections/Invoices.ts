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
      'netTotal',
      'dueAmount',
      'paidAmount',
      'dueAt',
      'payments',
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
        description:
          'This field calculates automaticly based on previous invoice and you should add previous balance only in first invoice. ( Previous months balance which customer needs to pay )',
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
      admin: {
        readOnly: true,
      },
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
        hidden: true,
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'dueAt',
      type: 'date',
      required: true,
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
      name: 'payments',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'cash',
          options: [
            {
              label: 'Online',
              value: 'online',
            },
            {
              label: 'Cash',
              value: 'cash',
            },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          defaultValue: 0,
          required: true,
        },
        {
          name: 'paidAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'comments',
          type: 'textarea',
          admin: {
            description: 'Anything speacial that you want to mention?',
          },
        },
      ],
    },
    {
      label: 'Lost Bottles',
      type: 'collapsible',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'lostBottlesCount',
          label: 'How Many Bottles are Lost?',
          type: 'number',
        },
        {
          name: 'lostBottleAmount',
          label: 'Amount Per Bottle',
          type: 'number',
        },
        {
          name: 'lostBottlesTotalAmount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
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
