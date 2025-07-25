import { Page, Document, Text, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { format } from 'date-fns'
import QRCode from 'qrcode'

import TripInfo from './(components)/TripInfo'
import Table from './(components)/Table'
import { Area, Block, Customer, Transaction, Trip } from '@/payload-types'
import { generateTripReport } from '@/aggregations/trips'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 20,
    paddingBottom: 63,
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
  trip: Partial<Trip>
  qrDataURI: string
  transactions: Partial<Transaction>[]
  blocks: Partial<Block>[]
}


const TripPDF = ({ trip, transactions, blocks, qrDataURI }: TripProps) => {
  const areas = trip.areas as Area[];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.qrcode} src={qrDataURI} />
        <TripInfo trip={trip} />
        {areas.map((a) => {
          const areaBlocks = blocks.filter((b) => b.area === a.id)
          return (
            <>
              <Text style={{ marginTop: 10, fontFamily: 'Helvetica-Bold' }}>{a.name}</Text>
              {areaBlocks.map((block) => {
                const blockTransactions = transactions.filter((transaction) => {
                  const customer = transaction.customer as Customer
                  const customerBlock = customer.block as Block
                  return customerBlock.id === block.id
                })
                if (!blockTransactions.length) return
                return (
                  <>
                    <Text style={{ marginTop: 8, fontFamily: 'Helvetica-BoldOblique' }}>
                      {block.name}
                    </Text>
                    <Table key={a.id} blockTransactions={blockTransactions} trip={trip} />
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
  const host = request.headers.get('x-forwarded-host') || request.headers.get('url');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const fullUrl = `${protocol}://${host}`;

  const payload = await getPayload({
    config: configPromise,
  });

  const tripId = (await params).id;

  const { trip, transactions, blocks } = await generateTripReport(tripId, payload);

  const qrDataURI = await QRCode.toDataURL(`${fullUrl}/invoices/${trip.id}/pdf`);

  const stream = await renderToStream(
    <TripPDF
      trip={trip}
      transactions={transactions}
      blocks={blocks}
      qrDataURI={qrDataURI}
    />,
  );

  const response = new NextResponse(stream as unknown as ReadableStream);
  response.headers.set(
    'Content-disposition',
    `inline; filename="trip-at-${format(trip.tripAt, 'dd-MM-yyyy')}.pdf"`,
  );

  return response;
}
