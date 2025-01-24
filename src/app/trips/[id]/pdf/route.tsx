import { Page, Document, Image, StyleSheet, renderToStream, View, Text } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { Invoice } from '@/payload-types'
import { getPayload } from 'payload'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// import InvoiceNo from './(components)/InvoiceNo'
// import InvoiceTitle from './(components)/InvoiceTitle'
// import BillTo from './(components)/BillTo'
// import InvoiceItemsTable from './(components)/InvoiceItemsTable'
// import InvoiceThankYouMsg from './(components)/InvoiceThankYouMsg'
import { log } from 'console'
import TripsTableHeader from './(components)/TripsTableHeader'
import InvoiveNo from './(components)/InvoiveNo'
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
interface InvoiceProps {
  invoice: Invoice
}

const InvoicePDF = ({ invoice, customerData }: any) => {
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



export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({
    config: configPromise,
  })

  const invoice = await payload.findByID({
    collection: 'trips',
    id: (await params).id,
    populate: ['transaction.customer']
  })

  // const customers = invoice.transaction?.docs?.map(async ({customer}:any) =>{
  //  return await payload.findByID({
  //     collection : 'customers',
  //     id : customer
  //   })
  // })   

  // const customer = invoice.transaction?.docs?.map(async (e: any) => {
  //   return await payload.findByID({
  //     collection: 'customers',
  //     id: e.customer
  //   })
  // })

  const customers = invoice.transaction?.docs?.map(c => c.customer)

  console.log(customers);



  const customerData = await payload.find({
    collection: 'customers',
    where: {
      id: { in: customers } // 'in' operator allows you to search for multiple IDs
    }
  })


  console.log(customerData);




  const stream = await renderToStream(<InvoicePDF invoice={invoice} customerData={customerData} />)
  return new NextResponse(stream as unknown as ReadableStream)
}