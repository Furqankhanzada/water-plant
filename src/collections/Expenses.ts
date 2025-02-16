import { CollectionConfig } from 'payload'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
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
          label: 'PSQCA',
          value: 'psqca',
        },
      ],
    },
    {
      name: 'expenseAt',
      type: 'date',
      required: true,
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
