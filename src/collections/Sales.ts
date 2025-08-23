import type { CollectionConfig, OptionObject } from 'payload'

export const Sales: CollectionConfig = {
  slug: 'sales',
  admin: {
    defaultColumns: ['channel', 'customer', 'date', 'status', 'total'],
  },
  access: {
  },
  fields: [
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Counter Sell', value: 'counter' },
        { label: 'Filler', value: 'filler' },
        { label: 'Bottles', value: 'bottles' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        condition: (data) => data.channel !== 'counter',
      },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid', value: 'partially_paid' },
        { label: 'Pending', value: 'pending' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totals',
      type: 'group',
      admin: {
        readOnly: true,
        description: 'Calculated totals for the sale',
      },
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'discount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'net',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'tax',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'gross',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'item',
      type: 'group',
      admin: {
        condition: (data) => data.channel !== 'counter',
      },
      fields: [
        {
          name: 'product',
          type: 'select',
          options: [
            { label: 'Filling 19L', value: 'filling-19L' },
            { label: 'Bottle 19L', value: 'bottle-19L' },
            { label: 'Bottle 6L', value: 'bottle-6L' },
            { label: 'Leaked Bottles and Caps', value: 'other-leaked-bottles' },
            { label: 'Plant Accessories', value: 'other-plant-accessories' },
            { label: 'Other', value: 'other-other' },
          ],
          filterOptions: ({ options, data }) => {
            if (data.channel === 'bottles') {
              return options.filter((option) => {
                option = option as OptionObject
                return option.value.includes('bottle-')
              })
            }
            if (data.channel === 'filler') {
            return options.filter((option) => {
              option = option as OptionObject
                return option.value.includes('filling-')
              })
            }
            if (data.channel === 'other') {
            return options.filter((option) => {
              option = option as OptionObject
                return option.value.includes('other-')
              })
            }
            return []
          },
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'taxRate',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'discount',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'fixed',
              options: [
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed', value: 'fixed' },
              ],
              admin: {
                condition: (_, item) => item.enabled,
              },
            },
            {
              name: 'value',
              type: 'number',
              required: true,
              defaultValue: 0,
              admin: {
                condition: (_, item) => item.enabled,
              },
            },
            {
              name: 'reason',
              type: 'select',
              options: [
                { label: 'Loyalty', value: 'loyalty' },
                { label: 'Promotion', value: 'promotion' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                condition: (_, item) => item.enabled,
              },
            }
          ]
        }
      ],
    },
    {
      name: 'payments',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'cash',
          required: true,
          options: [
            { label: 'Cash', value: 'cash' },
            { label: 'Online', value: 'online' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'paidAt',
          type: 'date',
          required: true,
          defaultValue: new Date(),
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },

  ],
}
