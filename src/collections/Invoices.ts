import type { CollectionConfig } from 'payload'

import { changeTransactionsStatusHook } from '@/hooks/invoices/changeTransactionsStatus'
import { calculateAmountsHook } from '@/hooks/invoices/calculateAmounts'
import { changeTransactionsStatusOnRemoval } from '@/hooks/invoices/changeTransactionsStatusOnRemoval'
import { unsetOldLatestInvoices } from '@/hooks/invoices/unsetOldLatestInvoices'
import { checkInvoiceDeletion } from '@/hooks/invoices/checkInvoiceDeletion'
import { populateCustomerFieldsHook } from '@/hooks/invoices/populateCustomerFields'
import { updatePerformanceOverview } from '@/hooks/invoices/updatePerformanceOverview'
import { isAdmin } from './access/isAdmin'

export const Invoice: CollectionConfig = {
  slug: 'invoice',
  trash: true,
  enableQueryPresets: true,
  disableDuplicate: true,
  disableBulkEdit: false,
  hooks: {
    afterChange: [unsetOldLatestInvoices, changeTransactionsStatusOnRemoval, updatePerformanceOverview],
    afterOperation: [changeTransactionsStatusHook],
    beforeChange: [calculateAmountsHook, populateCustomerFieldsHook],
    beforeDelete: [checkInvoiceDeletion],
  },
  admin: {
    defaultColumns: [
      'customer',
      'status',
      'unpaidInvoicesCount',
      'totals.subtotal',
      'totals.total',
      'totals.paid',
      'totals.balance',
      'dueAt',
      'payments',
      'sent',
      'pdf',
      'sendInvoice',
    ],
    groupBy: true
  },
  access: {
    delete: isAdmin,
  },
  fields: [
    {
      name: 'unpaidInvoicesCount',
      type: 'number',
      label: 'Unpaid',
      virtual: true,
      admin: {
        disableListFilter: true,
        components: {
          Cell: '/components/UnpaidInvoicesCountCell',
        },
      },
    },
    {
      name: 'isLatest',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'area',
      type: 'relationship',
      relationTo: 'areas',
      admin: {
        readOnly: true,
        description: 'Automatically populated from customer area',
      },
    },
    {
      name: 'block',
      type: 'relationship',
      relationTo: 'blocks',
      admin: {
        readOnly: true,
        description: 'Automatically populated from customer block',
      },
    },
    {
      name: 'transactions',
      type: 'relationship',
      relationTo: ['transaction', 'sales'],
      hasMany: true,
      required: true,
      filterOptions: ({ data }) => {
        return {
          customer: { equals: data.customer },
          status: { equals: 'unpaid' },
        }
      },
      /**
       * validate:
       * This ensures that the invoice always has at least one transaction,
       * even if the filtered options no longer include the originally selected transactions.
       *
       * Why:
       * After transactions are added to an invoice, their status is changed (e.g., to 'paid' or 'pending').
       * Because of this, those transactions no longer match the filter (`status: unpaid`),
       * and therefore show up as "invalid selections" when editing.
       *
       * Without `validate`, Payload CMS throws an error when editing an invoice that includes
       * now-filtered-out (originally valid according to the filter, but no longer match the filter conditions after a change) transactions.
       *
       * So this `validate` ensures:
       * - At least one transaction remains linked
       * - You can still save the invoice even if previously linked transactions are now filtered out
       */
      validate: async (value) => {
        if (!value || value.length === 0) {
          return 'At least one transaction is required.'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
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
        hidden: true,
      },
    },
    {
      name: 'previousBalance',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'This field calculates automaticly based on previous invoice and you should add previous balance only in first invoice. ( Previous months balance which customer needs to pay )',
          hidden: true,
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
        hidden: true,
      },
    },
    {
      name: 'dueAmount',
      type: 'number',
      label: 'Due Amount',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'paidAmount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        hidden: true,
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
        hidden: true,
      },
    },
    {
      name: 'remainingAmount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Customer needs to pay this amount to clear billig/invoice.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'totals',
      type: 'group',
      admin: {
        description: 'Calculated totals for the sale',
      },
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'discount',
          type: 'number',
          defaultValue: 0,
          admin: {},
        },
        {
          name: 'net',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'tax',
          type: 'number',
          defaultValue: 0,
          admin: {},
        },
        {
          name: 'previous',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'other',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Bottles lost/Damaged/Other',
          },
        },
        {
          label: 'Total',
          name: 'total',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Final amount that customer needs to pay',
          },
        },
        {
          name: 'paid',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'balance',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
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
      label: 'Advance Features',
      type: 'collapsible',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          label: 'Lost Bottles',
          name: 'lost',
          type: 'group',
          fields: [
            {
              name: 'count',
              label: 'How Many Bottles are Lost?',
              type: 'number',
            },
            {
              name: 'amount',
              label: 'Amount Per Bottle',
              type: 'number',
            },
            {
              name: 'total',
              label: 'Total Amount',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'lostBottlesCount',
          label: 'How Many Bottles are Lost?',
          type: 'number',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'lostBottleAmount',
          label: 'Amount Per Bottle',
          type: 'number',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'lostBottlesTotalAmount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            hidden: true,
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
    {
      name: 'sendInvoice',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/Invoices#SendInvoiceButton',
          Cell: {
            path: '/components/Invoices',
            exportName: 'SendInvoiceButton',
            serverProps: { cell: true },
          },
        },
      },
    },
    // {
    //   name: 'Transactions',
    //   type: 'ui',
    //   admin: {
    //      condition: (__, _, { operation }) => operation === 'update',
    //     components: {
    //       Field: '/components/Invoices#TransactionTable',
    //     },
    //   },
    // },
  ],
}
