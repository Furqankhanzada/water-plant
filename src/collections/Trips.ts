import type { CollectionConfig } from 'payload'

import { afterOperationHook } from '@/hooks/trips'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'tripAt',
    defaultColumns: ['tripAt', 'from', 'area', 'bottles', 'employee', 'status'],
  },
  hooks: {
    afterOperation: [afterOperationHook],
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
          name: 'area',
          label: 'Area',
          type: 'relationship',
          relationTo: 'areas',
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
      label: 'PDF Invoice',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/TripInvoices#GenerateTripInvoicePdf',
          Cell: {
            path: '/components/TripInvoices',
            exportName: 'GenerateTripInvoicePdf',
            serverProps: { cell: true },
          },
        },
      },
    },
    {
      name: 'transaction',
      type: 'join',
      on: 'trip',
      collection: 'transaction',
    },
  ],
}
