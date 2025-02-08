import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice, Transaction } from '@/payload-types'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  description2: {
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
  description: {
    width: '88%',
    textAlign: 'right',
  },
  total: {
    width: '12%',
    textAlign: 'right',
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const InvoiceTableFooter = ({ invoice }: { invoice: Invoice }) => {
  const totalBottlesCounts = invoice.transactions.reduce((total, item) => {
    item = item as Transaction
    return total + item.bottleGiven
  }, 0)
  return (
    <>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description2]}>
          Total Bottles Delivered
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>{totalBottlesCounts}</Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.rate]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.amount]} />
      </View>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>Net Total</Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.netTotal!)}
        </Text>
      </View>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
          Previous Balance
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.previousBalance!)}
        </Text>
      </View>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
          Previous Advance Balance
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.previousAdvanceAmount!)}
        </Text>
      </View>
      {invoice.status !== 'paid' && invoice.paidAmount ? (
        <View style={tableStyles.row}>
          <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
            Paid Amount
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.paidAmount!)}
          </Text>
        </View>
      ) : null}
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
          Amount to Pay
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {invoice.status !== 'paid' && invoice.paidAmount
            ? rupee.format(invoice.dueAmount! - invoice.paidAmount!)
            : rupee.format(invoice.dueAmount!)}
        </Text>
      </View>
    </>
  )
}

export default InvoiceTableFooter
