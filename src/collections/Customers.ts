import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'address',
          type: 'text',
        },
        {
          name: 'area',
          type: 'relationship',
          relationTo: 'areas',
          required: true,
        },
        {
          name: 'block',
          type: 'relationship',
          relationTo: 'blocks',
          required: true,
          filterOptions: ({ data }) => {
            return {
              area: { equals: data.area || '' },
            }
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rate',
          type: 'number',
          required: true,
          admin: {
            placeholder: 'Enter rate per bottel rate',
          },
        },

        {
          name: 'balance',
          type: 'number',
          required: true,
          admin: {
            placeholder: 'Enter the balance amount',
            description: 'Enter the current balance amount available.',
          },
        },
        {
          name: 'advance',
          type: 'number',
          required: true,
          admin: {
            placeholder: 'Enter advance payment amount',
            description: 'Enter the amount of advance payment made for the product or service.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Active',
              value: 'active',
            },
            {
              label: 'Archive',
              value: 'archive',
            },
          ],
          defaultValue: 'active',
          admin: {
            description: 'Set the user status to Active or Archive.',
          },
        },
        {
          name: 'bottlesAtHome',
          type: 'number',
          required: true,
          admin: {
            placeholder: 'Enter number of bottles at home',
            description: 'Enter the total number of bottles currently available at home.',
          },
        },
      ],
    },
    {
      name: 'contactNumbers',
      type: 'array',
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
