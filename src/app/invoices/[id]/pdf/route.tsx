import { Page, Document, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { format } from 'date-fns'

import InvoiceNo from './(components)/InvoiceNo'
import BillTo from './(components)/BillTo'
import InvoiceItemsTable from './(components)/InvoiceItemsTable'
import InvoiceThankYouMsg from './(components)/InvoiceThankYouMsg'
import { Customer, Invoice } from '@/payload-types'

const logoPath = resolve('./public/images/logo.jpg')
const paidStamp = resolve('./public/images/paid.png')

const paidStampData = readFileSync(paidStamp).toString('base64')
const paidStampSrc = `data:image/png;base64,${paidStampData}`

const logoData = readFileSync(logoPath).toString('base64')
const logoSrc = `data:image/jpeg;base64,${logoData}`

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 20,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  logo: {
    width: 229,
    height: 79,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paidStamp: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: 170,
    right: 20,
  },
})

interface InvoiceProps {
  invoice: Invoice
}

const InvoicePDF = ({ invoice }: InvoiceProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src={logoSrc} />
        {invoice.status === 'paid' ? (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image style={styles.paidStamp} src={paidStampSrc} />
        ) : null}
        <InvoiceNo invoice={invoice} />
        <BillTo invoice={invoice} />
        <InvoiceItemsTable invoice={invoice} />
        <InvoiceThankYouMsg />
      </Page>
    </Document>
  )
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({
    config: configPromise,
  })

  const invoice = await payload.findByID({
    collection: 'invoice',
    id: (await params).id,
  })
  const customer = invoice.customer as Customer

  const stream = await renderToStream(<InvoicePDF invoice={invoice} />)
  const response = new NextResponse(stream as unknown as ReadableStream)
  response.headers.set(
    'Content-disposition',
    `inline; filename="${customer.name} ${format(invoice.createdAt, 'dd-MM-yyyy')}.pdf"`,
  )
  return response
}
