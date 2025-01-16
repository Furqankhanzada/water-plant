import { Page, Document, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { Invoice } from '@/payload-types'
import { getPayload } from 'payload'
import { resolve } from 'path'
import { readFileSync } from 'fs'

import InvoiceNo from './(components)/InvoiceNo'
import InvoiceTitle from './(components)/InvoiceTitle'
import BillTo from './(components)/BillTo'
import InvoiceItemsTable from './(components)/InvoiceItemsTable'
import InvoiceThankYouMsg from './(components)/InvoiceThankYouMsg'
const logoPath = resolve('./public/images/logo.jpg')

const logoData = readFileSync(logoPath).toString('base64')
const logoSrc = `data:image/jpeg;base64,${logoData}`

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 50,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  logo: {
    width: 306.5,
    height: 106,
    marginLeft: 'auto',
    marginRight: 'auto',
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
        <InvoiceTitle title="Invoice" />
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

  const stream = await renderToStream(<InvoicePDF invoice={invoice} />)
  return new NextResponse(stream as unknown as ReadableStream)
}
