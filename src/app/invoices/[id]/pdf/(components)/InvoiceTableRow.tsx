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
    width: '60%',
    textAlign: 'left',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
  },
  qty: {
    width: '10%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: 'right',
    paddingRight: 8,
  },
  rate: {
    width: '15%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: 'right',
    paddingRight: 8,
  },
  amount: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 8,
  },
})

const InvoiceTableRow = ({ invoice }: { invoice: Invoice }) => {
  const rows = invoice.transactions.map((item) => {
    item = item as Transaction
    const customer = invoice.customer as Customer
    return (
      <View style={styles.row} key={item.id}>
        <Text style={styles.description}>
          Bottles Delivered on {format(item.transactionAt, 'EEEE Do	MMM yyyy')}
        </Text>
        <Text style={styles.qty}>{item.bottleGiven}</Text>
        <Text style={styles.rate}>{customer.rate}</Text>
        <Text style={styles.amount}>{item.total.toFixed(2)}</Text>
      </View>
    )
  })
  return <Fragment>{rows}</Fragment>
}

export default InvoiceTableRow
