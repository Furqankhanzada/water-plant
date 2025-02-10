import type { TaskConfig } from 'payload'
import Handlebars from 'handlebars'
import inlineCSS from 'inline-css'
import path from 'path'
import fs from 'fs'

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
  handler: async ({ input: { to, subject, templateName, data }, job, req }) => {
    console.info('Job Queue: ', job.queue, to)

    const templateFile = fs.readFileSync(
      path.join(process.cwd(), 'src', 'tasks', `${templateName}.html`),
      'utf8',
    )
    const getHTML = Handlebars.compile(templateFile)

    const templateData = {
      ...data,
      apiURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
      siteURL: process.env.PAYLOAD_PUBLIC_SITE_URL,
    }
    const preInlinedCSS = getHTML(templateData)

    const html = await inlineCSS(preInlinedCSS, {
      url: ' ',
      removeStyleTags: false,
    })

    const email = await req.payload.sendEmail({
      to,
      subject,
      html,
    })

    console.log('email response: ', email)

    return {
      output: {
        to,
      },
    }
  },
}
