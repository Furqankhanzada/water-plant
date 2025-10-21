import type { CollectionConfig } from 'payload'
import { isAdmin } from './access/isAdmin'
import { syncPaymentWithInvoiceHook } from '@/hooks/payments/syncPaymentWithInvoice'
import { checkPaymentDeletion } from '@/hooks/payments/checkPaymentDeletion'
import { injectInvoiceIdHook } from '@/hooks/payments/injectInvoiceId'

export const Payment: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'paidAt',
    defaultColumns: ['customer', 'amount', 'type', 'paidAt'],
    group: 'Financial',
  },
  access: {
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [injectInvoiceIdHook],
    afterChange: [syncPaymentWithInvoiceHook],
    beforeDelete: [checkPaymentDeletion],
  },
  fields: [
    // Required Relationships
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'customers',
          required: true,
          admin: {
            description: 'Customer who made the payment',
          },
        },
        {
          name: 'invoice',
          type: 'relationship',
          relationTo: 'invoice',
          filterOptions: ({ data }) => {
            if (!data?.customer) {
              return false // Return no results if no customer selected
            }
            return {
              customer: { equals: data.customer },
              isLatest: { equals: true },
            }
          },
          admin: {
            hidden: true,
            description: 'Associated invoice (only latest invoice shown)',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'cash',
          options: [
            { label: 'Cash', value: 'cash' },
            { label: 'Online', value: 'online' },
          ],
          admin: {
            description: 'Payment method',
          },
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0.01,
          admin: {
            description: 'Payment amount',
          },
        },
      ],
    },
    {
      name: 'paidAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        description: 'Date when payment was received',
      },
    },
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
      admin: {
        description: 'Associated trip (if payment was made during delivery)',
      },
    },
    {
      name: 'comments',
      type: 'textarea',
      admin: {
        description: 'Additional notes or comments about the payment',
      },
    },
  ],
}


