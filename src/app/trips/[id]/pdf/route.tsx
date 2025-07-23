import { Page, Document, Text, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { BasePayload, getPayload } from 'payload'
import { format } from 'date-fns'
import QRCode from 'qrcode'

import TripInfo from './(components)/TripInfo'
import Table from './(components)/Table'
import { Area, Block, Customer, Transaction, Trip } from '@/payload-types'
import { Types } from 'mongoose';
import { normalizeIds } from '@/lib/utils'

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

export const generateTripReport = async (tripId: string, payload: BasePayload) => {
  // 1. Fetch trip
  const trip = await payload.findByID({
    collection: 'trips',
    id: tripId,
    select: {
      areas: true,
      tripAt: true,
      blocks: true,
      bottles: true,
      status: true,
    },
    depth: 1,
  });

  // 2. Fetch relevant blocks
  const areaIds = trip.areas.map(a => typeof a === 'string' ? a : a.id);
  const blockIds = (trip.blocks || []).map(b => typeof b === 'string' ? b : b.id);

  const blockWhere: Record<string, { in: string[] }> = {
    area: { in: areaIds },
  };
  if (blockIds && blockIds?.length) blockWhere.id = { in: blockIds };

  const blocksPromise = payload.find({
    collection: 'blocks',
    where: blockWhere,
    select: { name: true, area: true },
    depth: 0,
    pagination: false,
  });

  // 3. Aggregation to fetch enriched transactions
  const transactionsPromise = payload.db.collections['transaction'].aggregate([
    { $match: { trip: new Types.ObjectId(tripId) } },

    // Lookup customer
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },

    // Lookup customer's block (optional)
    {
      $lookup: {
        from: 'blocks',
        localField: 'customer.block',
        foreignField: '_id',
        as: 'customer.block',
      },
    },
    { $unwind: { path: '$customer.block', preserveNullAndEmptyArrays: true } },

    // Lookup latest invoice for customer
    {
      $lookup: {
        from: 'invoices',
        let: { customerId: '$customer._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$customer', '$$customerId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { status: 1, advanceAmount: 1, remainingAmount: 1, dueAmount: 1 } },
        ],
        as: 'customer.invoice.docs',
      },
    },

    // Lookup latest transaction for customer (across all trips)
    {
      $lookup: {
        from: 'transactions',
        let: { customerId: '$customer._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$customer', '$$customerId'] },
                  { $gt: ['$bottleGiven', 0] },
                ],
              },
            },
          },
          { $sort: { transactionAt: -1 } },
          { $limit: 1 },
        ],
        as: 'customer.latestTransaction',
      },
    },
    { $unwind: { path: '$customer.latestTransaction', preserveNullAndEmptyArrays: true } },

    // Optional: project only required fields
    {
      $project: {
        customer: 1,
        bottleGiven: 1,
        bottleTaken: 1,
        remainingBottles: 1,
      },
    },
  ]);

  const [blocks, transactions] = await Promise.all([blocksPromise, transactionsPromise]);
  const data = {
    trip,
    blocks: blocks.docs,
    transactions: normalizeIds(transactions),
  };
  return data;
};

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
