import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name', // Display customer name in admin
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        doc.doIlikeIt = doc.name.includes('block')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true, // Customer name is required
    },
    {
      name: 'address',
      type: 'text',
    },
    {
      name: 'area', // Relate each customer to an area
      type: 'relationship',
      relationTo: 'areas', // Link to Areas collection
    },
    {
      name: 'block', // Relate each customer to a block
      type: 'relationship',
      relationTo: 'blocks', // Link to Blocks collection
      required: true,
    },
  ],
}
