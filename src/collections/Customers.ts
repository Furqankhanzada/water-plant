import type { CollectionConfig } from 'payload'

import { isAdmin } from './access/isAdmin'
import { checkCustomerDeletion } from '@/hooks/customers/checkCustomerDeletion'
import { updatePerformanceOverview } from '@/hooks/customers/updatePerformanceOverview'

export const Customers: CollectionConfig = {
  slug: 'customers',
  enableQueryPresets: true,
  disableDuplicate: true,
  trash: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'address', 'lastDelivered', 'area', 'block', 'rate'],
    listSearchableFields: ['name', 'address'],
    groupBy: true
  },
  access: {
    delete: isAdmin,
  },
  hooks: {
    afterChange: [updatePerformanceOverview],
    beforeDelete: [
      checkCustomerDeletion,
    ],
  },
  fields: [
    {
      name: 'lastDelivered',
      type: 'number',
      virtual: true,
      admin: {
        disableListFilter: true,
        hidden: true,
        components: {
          Cell: '/components/LastDeliveredCell',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Information',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'address',
                  type: 'text',
                  admin: {
                    width: '33.33%',
                  },
                },
                {
                  name: 'area',
                  type: 'relationship',
                  relationTo: 'areas',
                  required: true,
                  admin: {
                    width: '33.33%',
                  },
                },
                {
                  name: 'block',
                  type: 'relationship',
                  relationTo: 'blocks',
                  required: true,
                  filterOptions: ({ data, req: { pathname } }) => {
                    if (pathname.split('/').pop() === 'customers') return true
                    return {
                      area: { equals: data.area || '' },
                    }
                  },
                  admin: {
                    width: '33.33%',
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
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter rate per bottel rate',
                    width: '33.33%',
                  },
                },

                {
                  name: 'balance',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter the balance amount',
                    width: '33.33%',
                  },
                },
                {
                  name: 'advance',
                  label: 'Security Deposit',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter advance payment amount',
                    width: '33.33%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bottlesAtHome',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter number of bottles at home',
                    width: '50%',
                  },
                },
                {
                  name: 'deliveryFrequencyDays',
                  type: 'number',
                  defaultValue: 4,
                  admin: {
                    placeholder: 'Enter number of delivery frequency days',
                    width: '50%',
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
                    width: '50%',
                  },
                },
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  options: [
                    {
                      label: 'Regular Delivery',
                      value: 'delivery',
                    },
                    {
                      label: 'Delivery - Refill',
                      value: 'refill',
                    },
                    {
                      label: 'Filler',
                      value: 'filler',
                    },
                    {
                      label: 'Shop',
                      value: 'shop',
                    }
                  ],
                  defaultValue: 'delivery',
                  admin: {
                    width: '50%',
                  },
                }
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
                  name: 'type',
                  type: 'select',
                  options: [
                    {
                      label: 'WhatsApp',
                      value: 'whatsapp',
                    },
                  ],
                },
                {
                  name: 'contactNumber',
                  type: 'text',
                  required: true,
                  defaultValue: 0,
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
            {
              name: 'coordinates',
              type: 'group',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                },
                {
                  name: 'longitude',
                  type: 'number',
                },
              ],
            }
          ],
        },
        {
          label: 'Transactions',
          fields: [
            {
              name: 'transaction',
              type: 'join',
              on: 'customer',
              collection: 'transaction',
              defaultLimit: 30,
              defaultSort: '-transactionAt',
              admin: {
                defaultColumns: [
                  'transactionAt',
                  'bottleGiven',
                  'bottleTaken',
                  'remainingBottles',
                  'total',
                  'status',
                  'trip',
                ],
              },
            },
          ],
        },
        {
          label: 'Sales',
          fields: [
            {
              name: 'sales',
              type: 'join',
              on: 'customer',
              collection: 'sales',
              defaultLimit: 30,
              defaultSort: '-date',
              admin: {},
            },
          ],
        },
        {
          label: 'Invoices',
          fields: [
            {
              name: 'invoice',
              type: 'join',
              on: 'customer',
              collection: 'invoice',
              defaultSort: '-dueAt',
              admin: {
                defaultColumns: [
                  'status',
                  'totals.subtotal',
                  'totals.total',
                  'totals.paid',
                  'totals.balance',
                  'dueAt',
                  'payments',
                  'sent',
                  'pdf',
                  'sendInvoice',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
}
