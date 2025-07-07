import { Page, Document, View, Text, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
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
import { Company, Customer, Invoice, Media } from '@/payload-types'

const paidStamp = resolve('./public/images/paid.png')

const paidStampData = readFileSync(paidStamp).toString('base64')
const paidStampSrc = `data:image/png;base64,${paidStampData}`

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 20,
    paddingBottom: 50,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'column',
  },
  logo: {
    width: 229,
    height: 79,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  logoText: {
    marginLeft: 'auto',
    marginRight: 'auto',
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    marginBottom: 50,
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
  company: Company
}

const InvoicePDF = ({ invoice, qrDataURI, company }: InvoiceProps) => {
  const logo = company.logo as Media
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {}
        {logo && logo.url ? (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image style={styles.logo} source={logo.url} />
        ) : (
          <Text style={styles.logoText}>{company.name}</Text>
        )}
        {invoice.status === 'paid' ? (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image style={styles.paidStamp} src={paidStampSrc} />
        ) : null}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.qrcode} src={qrDataURI} />
        <InvoiceNo invoice={invoice} />
        <BillTo invoice={invoice} />
        <InvoiceItemsTable invoice={invoice} />
        <View style={{ fontSize: 10 }}>
          <Text style={{ marginTop: 8, marginBottom: 5, fontFamily: 'Helvetica-Bold' }}>
            Online Payment Options
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {company.paymentMethods?.map((paymentMethod) => {
              return (
                <View key={paymentMethod.id} style={{ marginRight: 20 }}>
                  <Text>Payment Method: {paymentMethod.name}</Text>
                  <Text>Account Title: {paymentMethod.accountTitle}</Text>
                  {paymentMethod.accountNo && <Text>Account No: {paymentMethod.accountNo}</Text>}
                  {paymentMethod.accountIBAN && <Text>IBAN: {paymentMethod.accountIBAN}</Text>}
                </View>
              )
            })}
          </View>
          <Text style={{ marginTop: 8, marginBottom: 5, fontFamily: 'Helvetica-Oblique' }}>
            After sending payment inform us on our WhatsApp Number{' '}
            {company.contactNumbers
              ?.filter((cn) => cn.type === 'whatsapp')
              .map((cn) => cn.contactNumber)}
          </Text>
        </View>
        <InvoiceThankYouMsg
          message={company.invoiceMessage ? company.invoiceMessage : 'Thank you for your business'}
        />
      </Page>
    </Document>
  )
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('url')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'

  const fullUrl = `${protocol}://${host}`

  const payload = await getPayload({
    config: configPromise,
  })

  const invoice = await payload.findByID({
    collection: 'invoice',
    id: (await params).id,
  })

  const company = await payload.findGlobal({
    slug: 'company',
  })

  company.logo = company.logo as Media
  company.logo.url = fullUrl + company.logo.url

  const customer = invoice.customer as Customer
  const qrDataURI = await QRCode.toDataURL(`${fullUrl}/invoices/${invoice.id}/pdf`)

  const stream = await renderToStream(
    <InvoicePDF invoice={invoice} qrDataURI={qrDataURI} company={company} />,
  )
  const response = new NextResponse(stream as unknown as ReadableStream)
  response.headers.set(
    'Content-disposition',
    `inline; filename="${customer.name} ${format(invoice.createdAt, 'dd-MM-yyyy')}.pdf"`,
  )
  return response
}
