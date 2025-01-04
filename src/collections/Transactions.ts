import type { CollectionConfig } from 'payload'

import { afterChangeHook } from '@/hooks/transactions'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  admin: {
    useAsTitle: 'transactionAt',
    defaultColumns: [
      'trip',
      'customer',
      'bottleGiven',
      'bottleTaken',
      'remainingBottles',
      'status',
    ],
  },
  hooks: {
    afterChange: [afterChangeHook],
  },
  fields: [
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
      required: true,
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
      name: 'remainingBottles',
      type: 'number',
      admin: {
        hidden: true,
      },
    },
  ],
}