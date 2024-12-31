import type { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'tripAt',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'From',
          type: 'text',
          required: true,
        },
        {
          name: 'Areas',
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
      name: 'transaction',
      type: 'join',
      on: 'trip',
      collection: 'transaction',
    },
  ],
}
