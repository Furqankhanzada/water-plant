import { GlobalConfig } from 'payload'

export const Company: GlobalConfig = {
  slug: 'company',
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'contactNumbers',
      type: 'array',
      labels: {
        singular: 'Contact Number',
        plural: 'Contact Numbers',
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
      name: 'paymentMethods',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'accountTitle',
          type: 'text',
        },
        {
          name: 'accountNo',
          type: 'text',
        },
        {
          label: 'Account IBAN',
          name: 'accountIBAN',
          type: 'text',
        },
      ],
    },
    {
      name: 'invoiceMessage',
      type: 'text',
    },
  ],
}
