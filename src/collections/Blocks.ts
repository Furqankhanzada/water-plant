import type { CollectionConfig } from 'payload'

export const Blocks: CollectionConfig = {
  slug: 'blocks',
  admin: {
    useAsTitle: 'name', // Display the block name instead of ID
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true, // Block name is required
    },
    {
      name: 'area', // Relate each block to an area
      type: 'relationship',
      relationTo: 'areas', // Link to the Areas collection
      required: true,
    },
    {
      name: 'customers', // Relationship to customers
      type: 'join',
      on: 'block',
      collection: 'customers', // Specify the collection being related to
    },
  ],
}
