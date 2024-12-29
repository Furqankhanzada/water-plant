import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name', // Display customer name in admin panel
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
      required: true,
    },
    {
      name: 'block', // Relate each customer to a block
      type: 'relationship',
      relationTo: 'blocks', // Link to Blocks collection
      required: true,
      filterOptions: ({ data }) => {
        return {
          area: { equals: data.area || '' },
        }
      },
    },
    {
      name: 'rate', // Add rate for the customer
      type: 'number',
      required: true,
      admin: {
        placeholder: 'Enter rate per bottel rate',
      },
    },
    {
      name: 'contactNumbers', // Add multiple contact numbers
      type: 'array', // Use array to allow multiple entries
      labels: {
        singular: 'Contact Number',
        plural: 'Contact Numbers',
      },
      admin: {
        components: {
          Cell: '/components/Customers#ContactNumberCell',
        },
      },
      fields: [
        {
          name: 'contactNumber',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Enter contact number',
          },
          hooks: {
            beforeValidate: [
              ({ value }) => {
                if (typeof value === 'string' && value.startsWith('03')) {
                  // Replace "03" with "+92"
                  return `+92${value.slice(1)}`
                }
                return value // Return the original value if no transformation is needed
              },
            ],
          },
          validate: (value: string | null | undefined) => {
            if (!value || typeof value !== 'string') {
              return 'Contact number is required.' // If value is null, undefined, or not a string
            }

            const pattern = /^\+92[0-9]{10}$/
            if (!pattern.test(value)) {
              return 'Contact number must start with "+92" and contain 13 digits.' // Pattern mismatch
            }

            return true // Validation passed
          },
        },
      ],
    },
  ],
}
