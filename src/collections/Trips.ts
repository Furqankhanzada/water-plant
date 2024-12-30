import type { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'tripAt', // Display customer name in admin panel
  },
  fields: [
    {
      name: 'From',
      type: 'text',
      required: true, // Destination is required
    },
    {
      name: 'Areas', // Relate each trip to an employee
      type: 'relationship',
      relationTo: 'areas', // Link to Employees collection
      required: true,
    },
    {
      name: 'employee', // Relate each trip to an employee
      type: 'relationship',
      relationTo: 'employee', // Link to Employees collection
      hasMany: true, // Allow multiple employees for a single trip

      required: true,
    },
    {
      name: 'bottel',
      type: 'number',
      required: true, // Start date is required
    },
    {
      name: 'tripAt',
      type: 'date',
      required: true, // Start date is required
      admin: {
        date: {
          pickerAppearance: 'dayOnly', // Show only day picker
          displayFormat: 'd MMM yyyy', // Display format for the date
        },
      },
    },
    {
      name: 'status', // Field for tracking progress status
      type: 'select',
      required: true,
      options: [
        {
          label: 'In Progress',
          value: 'inProgress',
        },
        {
          label: 'Complete',
          value: 'complete',
        },
      ],
      defaultValue: 'inProgress', // Default value is 'In Progress'
      admin: {
        description: 'Set the status to In Progress or Complete.',
      },
    },
  ],
}
