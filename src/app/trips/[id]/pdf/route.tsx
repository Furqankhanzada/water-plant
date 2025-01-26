import { Page, Document, Image, StyleSheet, renderToStream, View, Text } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { Customer, Invoice, Trip } from '@/payload-types'
import { getPayload } from 'payload'
import { resolve } from 'path'
import { readFileSync } from 'fs'


import TripsTableHeader from './(components)/TripsTableHeader'
import TripsTableRow from './(components)/TripsTableRow'
import TripsTableFooter from './(components)/TripsTableFooter'
import TripDetails from './(components)/TripDetails'

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
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 50,
    lineHeight: 1.5,
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  logo: {
    width: 229,
    height: 79,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paidStamp: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 100,
  },
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
})


const InvoicePDF = ({ invoice, customerData }: { invoice: Trip, customerData: any }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src={logoSrc} />

        <View style={styles.tableContainer}>
          <TripDetails invoice={invoice} />

          <View style={{ borderColor: '#3e85c5', borderWidth: 1, borderRadius: 16 }}>
            <TripsTableHeader />
            <TripsTableRow customerData={customerData} invoice={invoice} />
            <TripsTableFooter invoice={invoice} />
          </View>
        </View>

      </Page>
    </Document>
  )
}

interface TransactionDetail {
  id: string;
  trip: string;
  customer: string;
  status: string
  bottleGiven: number;
  bottleTaken: number;
  transactionAt: string;
  remainingBottles: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({
    config: configPromise,
  })

  const invoice = await payload.findByID({
    collection: 'trips',
    id: (await params).id,
  })

  const customers = invoice.transaction?.docs?.map((c: TransactionDetail | any) => c.customer)

  console.log(customers);



  const customerData = await payload.find({
    collection: 'customers',
    where: {
      id: { in: customers } // 'in' operator allows you to search for multiple IDs
    }
  })


  console.log(invoice.transaction);




  const stream = await renderToStream(<InvoicePDF invoice={invoice} customerData={customerData} />)
  return new NextResponse(stream as unknown as ReadableStream)
}