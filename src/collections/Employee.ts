import type { CollectionConfig } from 'payload'

export const Employee: CollectionConfig = {
  slug: 'employee',
  admin: {
    useAsTitle: 'name',
  },

  fields: [
    {
      name: 'name', // Name of the employee
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
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
            return value
          },
        ],
      },
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string') {
          return 'Contact number is required.'
        }

        const pattern = /^\+92[0-9]{10}$/
        if (!pattern.test(value)) {
          return 'Contact number must start with "+92" and contain 13 digits.'
        }

        return true
      },
    },
    {
      name: 'NICNumber',
      type: 'text',
      label: 'NIC Number',
      required: true,
      maxLength: 13,
      admin: {
        placeholder: 'Enter NIC number without dashes',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value === 'string') {
              // Remove any existing dashes
              const cleanedValue = value.replace(/-/g, '')
              // Add dashes in the correct format: 12345-1234567-1
              if (cleanedValue.length === 13) {
                return `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 12)}-${cleanedValue.slice(12)}`
              }
            }
            return value // Return the original value if no transformation is needed
          },
        ],
      },
      validate: (value: string | null | undefined) => {
        // Check if value is null, undefined, or not a string
        if (!value || typeof value !== 'string') {
          return 'NIC number is required.' // If value is invalid, return error
        }

        // NIC pattern: 5 digits - 7 digits - 1 digit
        const pattern = /^[0-9]{5}-[0-9]{7}-[0-9]$/
        if (!pattern.test(value)) {
          return 'NIC number must follow the format 12345-1234567-1.' // If pattern doesn't match, return error
        }

        return true // Validation passed
      },
    },
  ],
}
