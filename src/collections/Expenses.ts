import { CollectionConfig } from 'payload'
import { isAdmin } from './access/isAdmin'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  enableQueryPresets: true,
  disableDuplicate: true,
  admin: {
    defaultColumns: ['title', 'type', 'amount', 'expenseAt'],
  },
  access: {
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the expense (for example): Petrol for Trip at Bahria Town, Driver Salary, Bahria Town Gate Pass Fee',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Daily Miscellaneous',
          value: 'daily_miscellaneous',
        },
        {
          label: 'Fuel',
          value: 'fuel',
        },
        {
          label: 'Salary',
          value: 'salary',
        },
        {
          label: 'Plant Accessories',
          value: 'plant-accessories',
        },
        {
          label: 'Rent',
          value: 'rent',
        },
        {
          label: 'Utility Bills',
          value: 'utility_bills',
        },
        {
          label: 'Laboratory',
          value: 'laboratory',
        },
        {
          label: 'Gate Pass',
          value: 'gate_pass',
        },
        {
          label: 'Maintenance of Plant',
          value: 'maintenance_plant',
        },
        {
          label: 'Maintenance of Vehicle',
          value: 'maintenance_vehicle',
        },
        {
          label: 'Minerals',
          value: 'minerals',
        },
        {
          label: 'Bottles',
          value: 'bottles',
        },
        {
          label: 'PSQCA',
          value: 'psqca',
        },
      ],
    },
    {
      name: 'expenseAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy', // Display date in "29 Dec 2024" format
        },
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Amount that you spent',
      },
    },
  ],
}
