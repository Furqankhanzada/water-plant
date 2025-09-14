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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
                },
                {
                  name: 'paymentMethods',
                  type: 'group',
                  fields: [
                    {
                      name: 'cash',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'online',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'areas',
                  type: 'array',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                    },
                    {
                      name: 'collected',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'remaining',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'blocks',
                      type: 'array',
                      fields: [
                        {
                          name: 'blockId',
                          type: 'text',
                        },
                        {
                          name: 'blockName',
                          type: 'text',
                        },
                        {
                          name: 'collected',
                          type: 'number',
                          defaultValue: 0,
                        },
                        {
                          name: 'remaining',
                          type: 'number',
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
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
