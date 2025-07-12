import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'

export const getHandlebarsTemplate = (name: 'transaction') => {
  const templateFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'templates', `${name}.html`),
    'utf8',
  )
  return Handlebars.compile(templateFile)
}
