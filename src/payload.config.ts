// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Migration } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import nodemailer from 'nodemailer'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'

import { isWhatsAppEnabled } from './lib/sendWhatsAppMessage'
import { Company } from './globals/Company'
import { PerformanceOverview } from './globals/PerformanceOverview'
import { sendEmailTask } from './tasks/sendEmail'
import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Areas } from './collections/Areas'
import { Blocks } from './collections/Blocks'
import { Trips } from './collections/Trips'
import { Employee } from './collections/Employees'
import { Transaction } from './collections/Transactions'
import { Sales } from './collections/Sales'
import { Invoice } from './collections/Invoices'
import { Media } from './collections/Media'
import { Reports } from './collections/Reports'
import { Expenses } from './collections/Expenses'
import { Messages } from './collections/Messages'
import { Requests } from './collections/Requests'
import CronService from './services/cron'
import { migrations } from './migrations'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [
        {
          url: '/images/water-drop.png',
        },
      ],
    },
    components: {
      beforeDashboard: ['/components/performance-overview/PerformanceOverview'],
      graphics: {
        Icon: '/graphics/Branding.tsx#Icon',
        Logo: '/graphics/Branding.tsx#Logo',
      },
    },
  },
  globals: [Company, PerformanceOverview],
  collections: [
    Users,
    Customers,
    Areas,
    Blocks,
    Trips,
    Employee,
    Transaction,
    Sales,
    Invoice,
    Media,
    Reports,
    Expenses,
    ...(isWhatsAppEnabled() ? [Messages, Requests] : []),
  ],
  jobs: {
    autoRun: [
      {
        cron: '*/5 * * * *',
        queue: 'default',
      },
    ],
    tasks: [sendEmailTask],
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    prodMigrations: migrations as Migration[],
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
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
  bin: [
    {
      scriptPath: path.resolve(dirname, 'bin/send-invoices.ts'),
      key: 'send-invoices',
    },
  ],
  onInit: () => {
    console.log('### onInit ### PayloadCMS initiated ###')
    new CronService()
  },
})
