import { Page, Document, Text, Image, StyleSheet, renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { Types } from 'mongoose';
import configPromise from '@payload-config'
import { BasePayload, getPayload } from 'payload'
import { format } from 'date-fns'
import QRCode from 'qrcode'

import TripInfo from './(components)/TripInfo'
import Table from './(components)/Table'
import { Area, Block, Customer, Invoice, Transaction, Trip } from '@/payload-types'

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
  const areas = trip.areas as Area[]
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


const tripCustomers = async (trip: Trip, payload: BasePayload) => {

  const areaIds = trip.areas.map(a =>
    typeof a === 'string' ? new Types.ObjectId(a) : new Types.ObjectId(a.id)
  );

  const blockIds = (trip.blocks || []).map(b =>
    typeof b === 'string' ? new Types.ObjectId(b) : new Types.ObjectId(b.id)
  );

  const deliveryFrequencyDays = 6;
  const now = new Date();

  const match: Record<string, any> = {
    area: { $in: areaIds },
    status: 'active', // Assuming you want only active customers
  };

  if (blockIds.length) {
    match.block = { $in: blockIds };
  }

  console.log("match", match);

  const customers = await payload.db.collections['customers'].aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'transactions',
        let: { customerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$customer', '$$customerId'] },
                  {
                    $or: [
                      { $gt: ['$bottleGiven', 0] },
                      { $gt: ['$bottleTaken', 0] }
                    ]
                  }
                ]
              }
            }
          },
          { $sort: { transactionAt: -1 } },
          { $limit: 1 }
        ],
        as: 'latestTransaction',
      }
    },
    {
      $unwind: {
        path: '$latestTransaction',
        preserveNullAndEmptyArrays: true, // keep customers with no transactions
      },
    },
    {
      $addFields: {
        lastDeliveredDaysAgo: {
          $cond: {
            if: { $gt: ['$latestTransaction.transactionAt', null] },
            then: {
              $floor: {
                $divide: [
                  { $subtract: [now, '$latestTransaction.transactionAt'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            else: null,
          },
        },
        needsDelivery: {
          $cond: {
            if: {
              $or: [
                { $not: ['$latestTransaction.transactionAt'] },
                {
                  $gt: [
                    {
                      $divide: [
                        { $subtract: [now, '$latestTransaction.transactionAt'] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                    {
                      $ifNull: ['$deliveryFrequencyDays', deliveryFrequencyDays] // 👈 fallback to default
                    }
                  ],
                },
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $match: {
        needsDelivery: true,
      }
    }
  ]);

  console.log(`Customers needing delivery: ${customers.length}`, customers);

}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('url')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'

  const fullUrl = `${protocol}://${host}`

  const payload = await getPayload({
    config: configPromise,
  })

  const trip = await payload.findByID({
    collection: 'trips',
    id: (await params).id,
    select: {
      areas: true,
      tripAt: true,
      blocks: true,
      bottles: true,
      status: true,
    },
    depth: 1,
  })

  await tripCustomers(trip as Trip, payload);

  const areaIds = trip.areas.map(a => typeof a === 'string' ? a : a.id);
  const blockIds = (trip.blocks || []).map(b => typeof b === 'string' ? b : b.id);

  const where: Record<string, any> = {
    area: { in: areaIds },
  };

  if (blockIds.length) {
    where.id = { in: blockIds };
  }

  const blocks = await payload.find({
    collection: 'blocks',
    where,
    select: {
      name: true,
      area: true,
    },
    depth: 0,
    pagination: false,
  });

  const transactions = await payload.find({
    collection: 'transaction',
    where: {
      trip: {
        equals: trip.id,
      },
    },
    select: {
      customer: true,
      bottleGiven: true,
      bottleTaken: true,
      remainingBottles: true,
    },
    depth: 2,
    pagination: false,
  });

  for (const transaction of transactions.docs) {
    const customer = transaction.customer as Customer
    const invoices = await payload.find({
      collection: 'invoice',
      where: {
        customer: {
          equals: customer.id,
        },
      },
      limit: 1,
      sort: '-createdAt',
      select: {
        status: true,
        advanceAmount: true,
        remainingAmount: true,
        dueAmount: true,
      },
      pagination: false,
    })
    if (customer.invoice) {
      customer.invoice.docs = invoices.docs as Invoice[]
    }
  }

  const qrDataURI = await QRCode.toDataURL(`${fullUrl}/invoices/${trip.id}/pdf`)

  const stream = await renderToStream(
    <TripPDF
      trip={trip}
      transactions={transactions.docs}
      blocks={blocks.docs}
      qrDataURI={qrDataURI}
    />,
  )
  const response = new NextResponse(stream as unknown as ReadableStream)
  response.headers.set(
    'Content-disposition',
    `inline; filename="trip-at-${format(trip.tripAt, 'dd-MM-yyyy')}.pdf"`,
  )
  return response
}
