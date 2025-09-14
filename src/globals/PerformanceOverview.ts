import { GlobalConfig } from 'payload'
import { calculateProfit } from '@/hooks/performanceOverview/calculateProfit'

export const PerformanceOverview: GlobalConfig = {
  slug: 'performance-overview',
  admin: {
    hidden: true,
  },
  hooks: {
    beforeChange: [calculateProfit],
  },
  fields: [
    {
      name: 'today',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'thisMonth',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'lastMonth',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'thisWeek',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'thisQuarter',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'thisYear',
      type: 'group',
      fields: [
        {
          name: 'revenue',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'channels',
              type: 'array',
              fields: [
                {
                  name: 'channel',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'expenses',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'types',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
                {
                  name: 'total',
                  type: 'number',
                }
              ],
            },
          ],
        },
        {
          name: 'profit',
          type: 'number',
        },
        {
          name: 'bottlesDelivered',
          type: 'group',
          fields: [
            {
              name: 'total',
              type: 'number',
            },
            {
              name: 'expectedRevenue',
              type: 'number',
            },
            {
              name: 'averageRevenue',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'estimatedBottlesCustomerHolds',
      type: 'number',
    },
    {
      name: 'totalActiveCustomers',
      type: 'number',
    },
  ],
}
