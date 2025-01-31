import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Customer, Invoice, Transaction } from '@/payload-types'
import { format } from 'date-fns'

const borderColor = '#90e5fc'
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
  },
  description: {
    width: '50%',
    textAlign: 'left',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  qty: {
    width: '15%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: 'right',
    paddingRight: 8,
  },
  rate: {
    width: '12%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: 'right',
    paddingRight: 8,
  },
  amount: {
    width: '12%',
    textAlign: 'right',
    paddingRight: 8,
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const InvoiceTableRow = ({ invoice }: { invoice: Invoice }) => {
  const rows = invoice.transactions.map((item) => {
    item = item as Transaction
    const customer = invoice.customer as Customer
    return (
      <View style={styles.row} key={item.id}>
        <Text style={styles.description}>
          19 Liter Bottles - {format(item.transactionAt, 'EEE, MMM dd	yyyy')}
        </Text>
        <Text style={styles.qty}>+{item.bottleGiven}</Text>
        <Text style={styles.qty}>-{item.bottleTaken}</Text>
        <Text style={styles.rate}>{rupee.format(customer.rate)}</Text>
        <Text style={styles.amount}>{rupee.format(item.total)}</Text>
      </View>
    )
  })
  return <Fragment>{rows}</Fragment>
}

export default InvoiceTableRow
