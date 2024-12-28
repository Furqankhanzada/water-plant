import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'address',
      type: 'text',
    },
    // {
    //   name: 'customers',
    //   type: 'join',
    //   on: 'areas',
    //   collection: 'customers',
    // },
  ],
}
