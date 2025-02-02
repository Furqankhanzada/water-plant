import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice } from '@/payload-types'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  description: {
    width: '88.2%',
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
  return (
    <>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>Net Total</Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.dueAmount! - invoice.previousBalance!)}
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
          Amount to Pay
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.dueAmount!)}
        </Text>
      </View>
    </>
  )
}

export default InvoiceTableFooter
