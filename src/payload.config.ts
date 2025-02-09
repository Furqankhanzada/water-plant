// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import nodemailer from 'nodemailer'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Areas } from './collections/Areas'
import { Blocks } from './collections/Blocks'
import { Trips } from './collections/Trips'
import { Employee } from './collections/Employees'
import { Transaction } from './collections/Transactions'
import { Invoice } from './collections/Invoices'
import { Media } from './collections/Media'
import { Company } from './globals/Company'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [Company],
  collections: [Users, Customers, Areas, Blocks, Trips, Employee, Transaction, Invoice, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  // plugins: [payloadCloudPlugin()],
  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: 'public-read',
      },
    }),
  ],
  email: nodemailerAdapter({
    defaultFromAddress: process.env.FROM_EMAIL!,
    defaultFromName: process.env.FROM_NAME!,
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
})
