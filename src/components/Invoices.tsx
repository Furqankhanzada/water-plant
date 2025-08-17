import Link from 'next/link'
import { Column, ServerComponentProps } from 'payload'

import { isWhatsAppEnabled } from '@/lib/sendWhatsAppMessage'
import { Pill, Table } from '@payloadcms/ui'

export const GeneratePdfButton = async (
  props: ServerComponentProps & { rowData: { id: string } },
) => {
  if (!props.id && !props.rowData) {
    return null
  }
  return (
    <Link
      target="_blank"
      style={{
        display: 'inline-block',
        marginBlock: `${props.id ? 'revert-layer' : 'auto'}`,
      }}
      href={`/invoices/${props.id ? props.id : props.rowData.id}/pdf`}
      className={`btn btn--size-${props.id ? 'medium' : 'small'} btn--style-primary`}
    >
      Generate Invoice
    </Link>
  )
}

export const SendInvoiceButton = async (
  props: ServerComponentProps & { rowData: { id: string } },
) => {
  if (!isWhatsAppEnabled()) return null
  if (!props.id && !props.rowData) {
    return null
  }
  const invoiceId = props.id ? props.id : props.rowData.id
  return (
    <Link
      target="_blank"
      style={{
        display: 'inline-block',
        marginBlock: `${props.id ? 'revert-layer' : 'auto'}`,
        ...(props.id && { marginLeft: '10px' }),
      }}
      href={`/invoices/${invoiceId}/send`}
      className={`btn btn--size-${props.id ? 'medium' : 'small'} btn--style-pill`}
    >
      Send Invoice
    </Link>
  )
}

export const TransactionTable = async ({ data, payload }: ServerComponentProps) => {
  const transactions = await payload.find({
    collection: 'transaction',
    where: {
      id: {
        in: data.transactions,
      },
    },
    depth: 2,
  })
  const columns: Column[] = [
    {
      accessor: 'transactionAt',
      active: true,
      field: { type: 'date', name: 'Transaction At' },
      Heading: <span>Transaction At</span>,
      renderedCells: transactions.docs.map((tx) => (
        <span key={tx.id}>{new Date(tx.transactionAt).toLocaleDateString()}</span>
      )),
    },
    {
      accessor: 'customer',
      active: true,
      field: { type: 'relationship', name: 'customer', relationTo: 'transaction' },
      Heading: <span>Customer</span>,
      renderedCells: transactions.docs.map((tx) => (
        <span key={tx.id}>{typeof tx.customer === 'string' ? tx.customer : tx.customer?.name}</span>
      )),
    },
    {
      accessor: 'bottleGiven',
      active: true,
      field: { type: 'number', name: 'Bottle Given' },
      Heading: <span>Bottle Given</span>,
      renderedCells: transactions.docs.map((tx) => <span key={tx.id}>{tx.bottleGiven}</span>),
    },
    {
      accessor: 'bottleTaken',
      active: true,
      field: { type: 'number', name: 'Bottle Taken' },
      Heading: <span>Bottle Taken</span>,
      renderedCells: transactions.docs.map((tx) => <span key={tx.id}>{tx.bottleTaken}</span>),
    },
    {
      accessor: 'remainingBottles',
      active: true,
      field: { type: 'number', name: 'Remaining Bottles' },
      Heading: <span>Remaining</span>,
      renderedCells: transactions.docs.map((tx) => <span key={tx.id}>{tx.remainingBottles}</span>),
    },
    {
      accessor: 'total',
      active: true,
      field: { type: 'number', name: 'Total' },
      Heading: <span>Total</span>,
      renderedCells: transactions.docs.map((tx) => <span key={tx.id}>{tx.total}</span>),
    },
    {
      accessor: 'status',
      active: true,
      field: { type: 'text', name: 'Status' },
      Heading: <span>Status</span>,
      renderedCells: transactions.docs.map((tx) => <span key={tx.id}>{tx.status}</span>),
    },
    {
      accessor: 'trip',
      active: true,
      field: { type: 'relationship', name: 'Trip', relationTo: 'transaction' },
      Heading: <span>Trip</span>,
      renderedCells: transactions.docs.map((tx) => (
        <span key={tx.id}>{typeof tx.trip === 'string' ? tx.trip : tx.trip?.tripAt}</span>
      )),
    },
  ]

  columns.unshift({
    accessor: 'collection',
    active: true,
    field: {
      admin: {
        disabled: true,
      },
      hidden: true,
    },
    Heading: 'Type',
    renderedCells: (transactions?.docs || []).map((doc, i) => (
      <Pill key={i} size="small">
        Transactions
      </Pill>
    )),
  } as Column)

  return <Table appearance="condensed" columns={columns} data={(transactions.docs as any) || []} />
}
