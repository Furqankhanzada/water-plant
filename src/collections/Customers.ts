import type { CollectionConfig } from 'payload'

import { isAdmin } from './access/isAdmin'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'address', 'area', 'block', 'rate'],
    listSearchableFields: ['name', 'address'],
  },
  access: {
    delete: isAdmin,
  },
  fields: [
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
                },
                {
                  name: 'email',
                  type: 'email',
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
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter rate per bottel rate',
                  },
                },

                {
                  name: 'balance',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter the balance amount',
                  },
                },
                {
                  name: 'advance',
                  label: 'Security Deposit',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter advance payment amount',
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
                },
                {
                  name: 'bottlesAtHome',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    placeholder: 'Enter number of bottles at home',
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
                  'dueAmount',
                  'paidAmount',
                  'dueAt',
                  'paidAt',
                  'sent',
                  'pdf',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
}
