import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { isAfter } from 'date-fns'

import { Customer, Invoice, Transaction, Trip } from '@/payload-types'
import { tableStyles } from './Table'
import { formatDistanceWithFallback } from '@/lib/utils'

const styles = StyleSheet.create({
  name: { width: '15%' },
  address: { width: '20%' },
  delivered: { width: '9%' },
  returned: { width: '9%' },
  remaining: { width: '10%' },
  paymentReceived: { width: '13%' },
  paymentDue: { width: '13%' },
  lastDelivered: { width: '12%' },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const PARTIALLY_PAID_THRESHOLD = 1000

type CustomerWithLatestTransaction = Customer & {
  latestTransaction?: {
    transactionAt?: Date
  }
}

/** Payment due calculation */
const getPaymentDue = (invoice?: Invoice): number => {
  if (!invoice) return 0
  switch (invoice.status) {
    case 'paid':
    case 'partially-paid':
      return invoice.totals?.balance ?? 0
    default:
      return invoice.totals?.total ?? 0
  }
}

/** Invoice cell coloring */
const getInvoiceCellStyle = (invoice?: Invoice) => {
  if (!invoice) return {}

  const { status, dueAt } = invoice
  const isOverdue = dueAt ? isAfter(new Date(), new Date(dueAt)) : false
  const dueAmount = getPaymentDue(invoice)

  const colors = {
    unpaidCritical: { backgroundColor: '#e13125ff', color: '#fff' },
    partialCritical: { backgroundColor: '#ffc3b9ff', color: '#000' },
  }

  if (status === 'unpaid') return colors.unpaidCritical
  if (status === 'partially-paid' && isOverdue && dueAmount >= PARTIALLY_PAID_THRESHOLD) {
    return colors.partialCritical
  }
  return {}
}

/** Priority highlighting */
type Priority = 'URGENT' | 'HIGH'
const priorityColors: Record<Priority, { backgroundColor: string; color: string }> = {
  URGENT: { backgroundColor: '#e13125ff', color: '#fff' },
  HIGH: { backgroundColor: '#ffc3b9ff', color: '#000' },
}

interface TableRowProps {
  blockTransactions: Partial<Transaction>[]
  trip: Partial<Trip>
}

const TableRow: React.FC<TableRowProps> = ({ blockTransactions, trip }) => {
  const rows = blockTransactions.map((transaction, i) => {
    const odd = i % 2 !== 0
    const customer = transaction.customer as CustomerWithLatestTransaction
    if (!customer) return null

    const invoices = customer.invoice?.docs as Invoice[] | undefined
    const latestInvoice = invoices?.[0]
    const paymentDue = getPaymentDue(latestInvoice)

    const transactionAt = customer.latestTransaction?.transactionAt
    const lastDelivered = formatDistanceWithFallback(transactionAt, { fallback: 'Never Delivered' })

    const rowBgColor = getInvoiceCellStyle(latestInvoice)
    const priority = transaction.analytics?.priority as Priority

    return (
      <View key={customer.id} style={[tableStyles.row, odd ? { backgroundColor: '#f2f2f2' } : {}]}>
        <Text style={[tableStyles.column, styles.name, rowBgColor]}>{customer.name}</Text>
        <Text style={[tableStyles.column, styles.address]}>{customer.address}</Text>
        <Text style={[tableStyles.column, styles.delivered]}>
          {trip.status === 'complete' ? transaction.bottleGiven : ''}
        </Text>
        <Text style={[tableStyles.column, styles.returned]}>
          {trip.status === 'complete' ? transaction.bottleTaken : ''}
        </Text>
        <Text style={[tableStyles.column, styles.remaining]}>
          {trip.status === 'complete' ? transaction.remainingBottles : ''}
        </Text>
        <Text style={[tableStyles.column, styles.paymentReceived]} />
        <Text style={[tableStyles.column, styles.paymentDue]}>{rupee.format(paymentDue)}</Text>
        <Text
          style={[
            tableStyles.column,
            styles.lastDelivered,
            priority ? priorityColors[priority] : {},
          ]}
        >
          {`${priority?.charAt(0) ?? ''} | ${lastDelivered}`}
        </Text>
      </View>
    )
  })

  return <Fragment>{rows}</Fragment>
}

export default TableRow
