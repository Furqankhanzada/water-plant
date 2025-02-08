import { Page, Document, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { format } from 'date-fns'
import QRCode from 'qrcode'

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
    paddingBottom: 50,
    paddingLeft: 30,
    paddingRight: 30,
    // lineHeight: 1.5,
    flexDirection: 'column',
  },
  logo: {
    width: 229,
    height: 79,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paidStamp: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 140,
    right: 80,
  },
  qrcode: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 140,
    right: 25,
  },
})

interface InvoiceProps {
  invoice: Invoice
  qrDataURI: string
}

const InvoicePDF = ({ invoice, qrDataURI }: InvoiceProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src={logoSrc} />
        {invoice.status === 'paid' ? (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image style={styles.paidStamp} src={paidStampSrc} />
        ) : null}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.qrcode} src={qrDataURI} />
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
  const qrDataURI = await QRCode.toDataURL(`https://ldw.furqan.codes/invoices/${invoice.id}/pdf`)

  const stream = await renderToStream(<InvoicePDF invoice={invoice} qrDataURI={qrDataURI} />)
  const response = new NextResponse(stream as unknown as ReadableStream)
  response.headers.set(
    'Content-disposition',
    `inline; filename="${customer.name} ${format(invoice.createdAt, 'dd-MM-yyyy')}.pdf"`,
  )
  return response
}
