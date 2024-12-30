import type { CollectionConfig } from 'payload'

export const Transaction: CollectionConfig = {
  slug: 'transaction',
  fields: [
    {
      name: 'trips', // Relate each trip to an employee
      type: 'relationship',
      relationTo: 'trips', // Link to Employees collection
      required: true,
    },
    {
      name: 'customers', // Relate each trip to an employee
      type: 'relationship',
      relationTo: 'customers', // Link to Employees collection
      required: true,
    },
    {
      name: 'employee', // Relate each trip to an employee
      label: 'Delivered by',
      type: 'relationship',
      relationTo: 'employee', // Link to Employees collection
      required: true,
    },

    {
      name: 'status', // Field for transaction status
      label: 'Transaction Status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Paid',
          value: 'paid',
        },
        {
          label: 'Unpaid',
          value: 'unpaid',
        },
      ],
    },
    {
      name: 'bottleGiven', // Field for tracking bottles given
      type: 'number', // Field type set to number
      required: true, // Make it a required field (if necessary)
      admin: {
        placeholder: 'Enter the number of bottles given', // Optional admin UI hint
      },
    },

    {
      name: 'bottleTaken', // Field for tracking bottles taken
      type: 'number', // Field type set to number
      required: true, // Make it a required field (if necessary)
      admin: {
        placeholder: 'Enter the number of bottles taken', // Optional admin UI hint
      },
    },
  ],
}
