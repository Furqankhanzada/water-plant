import type { CollectionConfig } from 'payload'
import { isAdmin } from './access/isAdmin'

export const Areas: CollectionConfig = {
  slug: 'areas',
  disableDuplicate: true,
  admin: {
    useAsTitle: 'name', // This ensures the 'name' field is displayed instead of the ID
  },
  access: {
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name', // Name of the area
      type: 'text',
      required: true,
    },
    {
      name: 'block', // Relationship to customers
      type: 'join',
      on: 'area',
      collection: 'blocks', // Specify the collection being related to
    },
  ],
}
