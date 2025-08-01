import type { CollectionConfig, FieldAccess } from 'payload'

import { calculateRemainingBottles } from '@/hooks/transactions/remainingBottles'
import { calculateTotalHook } from '@/hooks/transactions/total'
import { transactionUpdateForCustomer } from '@/hooks/transactions/transactionUpdateForCustomer'
import { populateAdjustedBy } from '@/hooks/transactions/populateAdjustedBy'
import { isAdmin } from './access/isAdmin'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  enableQueryPresets: true,
  admin: {
    pagination: {
      defaultLimit: 50,
    },
    useAsTitle: 'transactionAt',
    defaultColumns: [
      'transactionAt',
      'customer',
      'transactionType',
      'bottleGiven',
      'bottleTaken',
      'remainingBottles',
      'total',
      'status',
      'manualOverride',
      'trip',
    ],
  },
  hooks: {
    afterChange: [],
    beforeChange: [
      populateAdjustedBy,
      calculateRemainingBottles,
      calculateTotalHook,
      transactionUpdateForCustomer,
    ],
  },
  fields: [
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
      admin: {
        sortOptions: '-tripAt',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'transactionType',
      type: 'select',
      required: true,
      defaultValue: 'delivery',
      options: [
        { label: 'Regular Delivery', value: 'delivery' },
        { label: 'Manual Adjustment', value: 'adjustment' },
      ],
    },
    {
      name: 'manualOverride',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check if this transaction bypasses automatic calculations',
      },
    },
    {
      name: 'overrideReason',
      type: 'textarea',
      required: true,
      admin: {
        condition: (data) => data.manualOverride,
        placeholder: 'Explain why manual override was necessary...',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ req }) => req.user?.id || null,
      admin: {
        readOnly: true,
        description: 'User who made the manual adjustment',
      },
    },
    {
      name: 'lastDelivered',
      type: 'number',
      virtual: true,
      admin: {
        hidden: true,
        components: {
          Cell: '/components/LastDeliveredCell',
        },
      },
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
        readOnly: false,
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
