import { GlobalConfig } from 'payload'

export const WhatsApp: GlobalConfig = {
  slug: 'whatsapp',
  label: 'WhatsApp',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'adminPhones',
      type: 'array',
      label: 'Admin Phone Numbers',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'WhatsAppManager',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/whatsapp/WhatsAppManager',
        },
      },
    },
  ],
}
