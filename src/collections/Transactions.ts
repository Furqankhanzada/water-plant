import type { CollectionConfig } from 'payload'
import { transactionBeforeChange } from '@/hooks/transactions/transactionBeforeChange'
import { checkTransactionDeletion } from '@/hooks/transactions/checkTransactionDeletion'
import { isAdmin } from './access/isAdmin'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  enableQueryPresets: true,
  disableDuplicate: true,
  admin: {
    pagination: {
      defaultLimit: 50,
    },
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
    groupBy: true
  },
  access: {
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [transactionBeforeChange],
    beforeDelete: [checkTransactionDeletion],
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
    {
      name: 'priority',
      type: 'text',
      virtual: 'analytics.priority',
      hooks: {
        afterRead: [({ data }) => data?.analytics?.priority],
      },
      admin: {
        hidden: true,
      },
    },
    // {
    //   name: 'consumptionRate',
    //   label: 'Daily Consumption',
    //   type: 'text',
    //   virtual: 'analytics.consumptionRate',
    //   admin: {
    //     hidden: true,
    //     components: {
    //       Cell: '/components/Transactions#DailyConsumptionCell',
    //     },
    //   },
    // },
    {
      name: 'weeklyConsumption',
      type: 'text',
      virtual: 'analytics.weeklyConsumption',
      admin: {
        hidden: true,
        components: {
          Cell: '/components/Transactions#WeeklyConsumptionCell',
        },
      },
    },
    {
      name: 'adjustedConsumption',
      label: 'Daily Adjusted Consumption',
      type: 'text',
      virtual: 'analytics.adjustedConsumptionRate',
      admin: {
        hidden: true,
        components: {
          Cell: '/components/Transactions#AdjustedConsumptionCell',
        },
      },
    },
    {
      name: 'daysUntilDelivery',
      type: 'text',
      virtual: 'analytics.daysUntilDelivery',
      admin: {
        hidden: true,
        components: {
          Cell: '/components/Transactions#DaysUntilDeliveryCell',
        },
      },
    },
    {
      name: 'nextDeliveryDate',
      type: 'text',
      virtual: 'analytics.nextDeliveryDate',
      hooks: {
        afterRead: [({ data }) => data?.analytics?.nextDeliveryDate],
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        {
          type: 'number',
          name: 'consumptionRate',
        },
        {
          type: 'number',
          name: 'adjustedConsumptionRate',
        },
        {
          type: 'number',
          name: 'weeklyConsumption',
        },
        {
          type: 'number',
          name: 'daysUntilDelivery',
        },
        {
          type: 'date',
          name: 'nextDeliveryDate',
        },
        {
          type: 'select',
          name: 'priority',
          options: [
            {
              label: 'URGENT',
              value: 'URGENT',
            },
            {
              label: 'HIGH',
              value: 'HIGH',
            },
            {
              label: 'MEDIUM',
              value: 'MEDIUM',
            },
            {
              label: 'LOW',
              value: 'LOW',
            },
          ],
        },
      ],
      admin: {
        disableListColumn: true,
        hidden: true,
      },
    },
  ],
}
