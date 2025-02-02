import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  container: {
    fontSize: 10,
    borderTopWidth: 1,
  },
  description: {
    width: '50%',
  },
  qty: {
    width: '15%',
  },
  rate: {
    width: '12%',
  },
  amount: {
    width: '12%',
  },
})

const InvoiceTableHeader = () => (
  <View style={[tableStyles.row, styles.container]} fixed>
    <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
      Item - Delivery Date
    </Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Delivered Qty</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Returned Qty</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.rate]}>Rate</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.amount]}>Amount</Text>
  </View>
)

export default InvoiceTableHeader
