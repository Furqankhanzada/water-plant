import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice, Transaction } from '@/payload-types'
import { format } from 'date-fns'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  description: {
    width: '40%',
  },
  qty: {
    width: '12.66%',
    textAlign: 'right',
  },
  rate: {
    width: '10%',
    textAlign: 'right',
  },
  amount: {
    width: '12%',
    textAlign: 'right',
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const InvoiceTableRow = ({ invoice }: { invoice: Invoice }) => {
  const rows = invoice.transactions.map((item, i) => {
    item = item as Transaction
    return (
      <View style={tableStyles.row} key={item.id} break={i === 30}>
        <Text style={[tableStyles.column, styles.description]}>
          19 Liter Bottles - {format(item.transactionAt, 'EEE, MMM dd	yyyy')}
        </Text>
        <Text style={[tableStyles.column, styles.qty]}>+{item.bottleGiven}</Text>
        <Text style={[tableStyles.column, styles.qty]}>-{item.bottleTaken}</Text>
        <Text style={[tableStyles.column, styles.qty]}>{item.remainingBottles}</Text>
        <Text style={[tableStyles.column, styles.rate]}>
          {rupee.format(item.total / item.bottleGiven)}
        </Text>
        <Text style={[tableStyles.column, styles.amount]}>{rupee.format(item.total)}</Text>
      </View>
    )
  })
  return <Fragment>{rows}</Fragment>
}

export default InvoiceTableRow
