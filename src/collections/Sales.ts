import type { CollectionConfig, OptionObject } from 'payload'

import { calculateSalesTotals } from '@/hooks/sales/calculateSalesTotals'
import { setCounterStatus } from '@/hooks/sales/setCounterStatus'
import { isAdmin } from './access/isAdmin'

export const Sales: CollectionConfig = {
  slug: 'sales',
  trash: true,
  enableQueryPresets: true,
  disableDuplicate: true,
  disableBulkEdit: true,
  admin: {
    defaultColumns: ['date', 'channel', 'customer',  'item.product', 'totals.gross', 'status'],
    useAsTitle: 'channel',
    groupBy: true,
  },
  access: {
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [setCounterStatus, calculateSalesTotals],
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
      fields: [
        {
          name: 'product',
          type: 'select',
          options: [
            { label: 'Walk In Filling', value: 'counter-walk-in-filling' },
            { label: 'Filling 19L', value: 'filling-19L' },
            { label: 'Bottle 19L', value: 'bottle-19L' },
            { label: 'Bottle 6L', value: 'bottle-6L' },
            { label: 'Leaked Bottles and Caps', value: 'other-leaked-bottles' },
            { label: 'Plant Accessories', value: 'other-plant-accessories' },
            { label: 'Other', value: 'other-other' },
          ],
          filterOptions: ({ options, data }) => {
            if(data.channel === 'counter') {
              return options.filter((option) => {
                option = option as OptionObject
                return option.value.includes('counter-')
              })
            }
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
  ],
}
