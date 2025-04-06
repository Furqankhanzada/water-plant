import type { CollectionConfig } from 'payload'

import { calculateRemainingBottles } from '@/hooks/transactions/remainingBottles'
import { calculateTotalHook } from '@/hooks/transactions/total'
import { transactionUpdateForCustomer } from '@/hooks/transactions/transactionUpdateForCustomer'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  enableQueryPresets: true,
  admin: {
    useAsTitle: 'transactionAt',
    defaultColumns: [
      'transactionAt',
      'customer',
      'bottleGiven',
      'bottleTaken',
      'remainingBottles',
      'total',
      'status',
      'trip',
    ],
  },
  hooks: {
    afterChange: [],
    beforeChange: [calculateRemainingBottles, calculateTotalHook, transactionUpdateForCustomer],
  },
  fields: [
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'status',
      label: 'Transaction Status',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
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
          label: 'Pending',
          value: 'pending',
        },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'bottleGiven',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        placeholder: 'Enter the number of bottles given',
      },
    },
    {
      name: 'bottleTaken',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        placeholder: 'Enter the number of bottles taken',
      },
    },
    {
      name: 'remainingBottles',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Bottles at home/office, calculates automaticly based on last transaction',
      },
    },
    {
      name: 'transactionAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly', // Only show date picker (no time)
          displayFormat: 'd MMM yyyy', // Display date in "29 Dec 2024" format
        },
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        hidden: true,
      },
    },
  ],
}
