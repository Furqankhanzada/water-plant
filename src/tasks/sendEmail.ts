import type { TaskConfig } from 'payload'

export const sendEmailTask: TaskConfig<'sendEmail'> = {
  slug: 'sendEmail',
  inputSchema: [
    {
      name: 'to',
      type: 'text',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'templateName',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
    },
  ],
  retries: 2,
  handler: async ({ input: { to }, job }) => {
    console.info('Job Queue: ', job.queue, to)
    return {
      output: {
        to,
      },
    }
  },
}
