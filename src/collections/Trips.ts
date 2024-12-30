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
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bottles',
          type: 'number',
          required: true,
        },
        {
          name: 'tripAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
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
    {
      name: 'transaction', // Relationship to customers
      type: 'join',
      on: 'trips',
      collection: 'transaction', // Specify the collection being related to
    },
  ],
}
