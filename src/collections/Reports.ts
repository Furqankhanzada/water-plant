import { CollectionConfig } from 'payload'

import { generateReport } from '@/hooks/reports/generateReport'
import { isAdmin } from './access/isAdmin'

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: {
    defaultColumns: [
      'month',
      'totalCollection',
      'totalExpenses',
      'totalBottlesDelivered',
      'totalExpectedIncome',
      'totalDueAmount',
    ],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [generateReport],
  },
  fields: [
    {
      name: 'month',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MMMM',
        },
      },
    },
    {
      name: 'totalCollection',
      type: 'text',
      defaultValue: 0,
      hooks: {
        afterRead: [
          ({ data }) => {
            return rupee.format(data?.totalCollection)
          },
        ],
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalExpenses',
      type: 'text',
      hooks: {
        afterRead: [
          ({ data }) => {
            return rupee.format(data?.totalExpenses)
          },
        ],
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalBottlesDelivered',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalExpectedIncome',
      type: 'text',
      hooks: {
        afterRead: [
          ({ data }) => {
            return rupee.format(data?.totalExpectedIncome)
          },
        ],
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalDueAmount',
      type: 'text',
      hooks: {
        afterRead: [
          ({ data }) => {
            return rupee.format(data?.totalDueAmount)
          },
        ],
      },
      admin: {
        readOnly: true,
        description: 'Needs to recover overall due amount',
      },
    },
  ],
}
