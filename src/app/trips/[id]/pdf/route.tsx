import { Page, Document, Text, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import QRCode from 'qrcode'

import TripInfo from './(components)/TripInfo'
import Table from './(components)/Table'
import { Area, Block, Customer, Transaction, Trip } from '@/payload-types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
  },
  qrcode: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 20,
    right: 25,
  },
})

interface TripProps {
  trip: Trip
  qrDataURI: string
  customers: Partial<Customer>[]
}

const TripPDF = ({ trip, customers, qrDataURI }: TripProps) => {
  const area = trip.area as Area
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.qrcode} src={qrDataURI} />
        <TripInfo trip={trip} />
        {[area].map((a) => {
          return (
            <>
              <Text style={{ marginTop: 10, fontFamily: 'Helvetica-Bold' }}>{a.name}</Text>
              {a.block?.docs?.map((blockId) => {
                const blockCustomers = customers.filter((customer) => {
                  const block = customer.block as Block
                  return block.id === blockId
                })
                if (!blockCustomers.length) return
                const block = blockCustomers[0].block as Block
                return (
                  <>
                    <Text style={{ marginTop: 8, fontFamily: 'Helvetica-BoldOblique' }}>
                      {block.name}
                    </Text>
                    <Table key={a.id} customers={blockCustomers} />
                  </>
                )
              })}
            </>
          )
        })}
      </Page>
    </Document>
  )
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({
    config: configPromise,
  })

  const trip = await payload.findByID({
    collection: 'trips',
    id: (await params).id,
  })

  const transactions = trip.transactions?.docs as Transaction[]
  const customerIds = transactions.map((c) => c.customer)

  const customers = await payload.find({
    collection: 'customers',
    where: {
      id: { in: customerIds },
    },
    depth: 1,
    pagination: false,
    select: {
      name: true,
      address: true,
      area: true,
      block: true,
      invoice: true,
    },
  })

  const qrDataURI = await QRCode.toDataURL(`https://ldw.furqan.codes/invoices/${trip.id}/pdf`)

  const stream = await renderToStream(
    <TripPDF trip={trip} customers={customers.docs} qrDataURI={qrDataURI} />,
  )
  const response = new NextResponse(stream as unknown as ReadableStream)
  response.headers.set(
    'Content-disposition',
    `inline; filename="trip-at-${format(trip.tripAt, 'dd-MM-yyyy')}.pdf"`,
  )
  return response
}
