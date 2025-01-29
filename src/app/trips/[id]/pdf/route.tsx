import { Page, Document, Image, StyleSheet, renderToStream, View, } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { Trip } from '@/payload-types'
import { getPayload } from 'payload'



import TripsTableHeader from './(components)/TripsTableHeader'
import TripsTableRow from './(components)/TripsTableRow'
import TripsTableFooter from './(components)/TripsTableFooter'
import TripDetails from './(components)/TripDetails'
import { number } from 'payload/shared'






const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 1.5,
    flexDirection: 'column',
    backgroundColor: 'white'
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
      <Page size="A3" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}

        <View style={styles.tableContainer}>
          <TripDetails invoice={invoice} />

          <View style={{ borderColor: '#3e85c5', borderWidth: 1 }}>
            <TripsTableHeader />
            <TripsTableRow customerData={customerData} invoice={invoice} />
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




  const customerData = await payload.find({
    collection: 'customers',
    where: {
      id: { in: customers } // 'in' operator allows you to search for multiple IDs
    }
  })














  const stream = await renderToStream(<InvoicePDF invoice={invoice} customerData={customerData} />)
  return new NextResponse(stream as unknown as ReadableStream)
}