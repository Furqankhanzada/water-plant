import type { CollectionConfig } from 'payload'

import { createTransactionsOnTripCreate } from '@/hooks/trips/createTransactionsOnTripCreate'
import { toggleTransactionsOnStatusChangeHook } from '@/hooks/trips/toggleTransactionsOnStatusChange'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'tripAt',
    defaultColumns: ['tripAt', 'from', 'areas', 'bottles', 'employee', 'status', 'pdf'],
  },
  hooks: {
    afterOperation: [createTransactionsOnTripCreate],
    beforeChange: [toggleTransactionsOnStatusChangeHook],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'from',
          type: 'text',
          required: true,
        },
        {
          name: 'areas',
          label: 'Areas',
          type: 'relationship',
          relationTo: 'areas',
          hasMany: true,
          required: true,
        },
        {
          name: 'bottles',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tripAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyy',
            },
          },
        },
        {
          name: 'employee',
          type: 'relationship',
          relationTo: 'employee',
          hasMany: true,
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            {
              label: 'In Progress',
              value: 'inprogress',
            },
            {
              label: 'Complete',
              value: 'complete',
            },
          ],
          defaultValue: 'inprogress',
          admin: {
            description: 'Set the status to In Progress or Complete.',
          },
        },
      ],
    },
    {
      name: 'pdf',
      label: 'PDF Trip Report',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/Trips#GeneratePdfButton',
          Cell: {
            path: '/components/Trips',
            exportName: 'GeneratePdfButton',
            serverProps: { cell: true },
          },
        },
      },
    },
    {
      name: 'transactions',
      type: 'join',
      on: 'trip',
      collection: 'transaction',
      defaultLimit: 1000,
      defaultSort: 'transactionAt',
    },
  ],
}
