import type { TaskHandler } from 'payload'
import Handlebars from 'handlebars'
import inlineCSS from 'inline-css'
import path from 'path'
import fs from 'fs'

export const sendEmailHandler: TaskHandler<'sendEmail'> = async ({
  input: { to, subject, templateName, ...data },
  job,
  req,
}) => {
  const templateFile = fs.readFileSync(path.join(__dirname, `${templateName}.html`), 'utf8')
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

  console.info('email: ', email)

  return {
    output: {
      to,
    },
  }
}
