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
    // {
    //   name: 'blocks', // Field for adding multiple blocks
    //   type: 'array',
    //   fields: [
    //     {
    //       name: 'name', // Block name
    //       type: 'text',
    //       required: true,
    //     },
    //   ],
    // },
    {
      name: 'customers', // Relationship to customers
      type: 'relationship',
      relationTo: 'customers', // Specify the collection being related to
      // hasMany: true, // An area can have multiple customers
    },
  ],
}
