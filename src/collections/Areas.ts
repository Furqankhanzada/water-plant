import type { CollectionConfig } from 'payload'

export const Areas: CollectionConfig = {
  slug: 'areas',
  admin: {
    useAsTitle: 'name', // This ensures the 'name' field is displayed instead of the ID
  },
  fields: [
    {
      name: 'name', // Name of the area
      type: 'text',
      required: true,
    },
    {
      name: 'customers', // Relationship to customers
      type: 'join',
      on: 'area',
      collection: 'customers', // Specify the collection being related to
    },
  ],
}
