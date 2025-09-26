import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  container: {
    fontSize: 10,
    borderTopWidth: 1,
  },
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
  discount: {
    width: '25.34%',
    textAlign: 'right',
  },
})

export const InvoiceTableTransactionHeader = () => (
  <View style={[tableStyles.row, styles.container]} fixed>
    <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
      Item - Delivery Date
    </Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Delivered</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Returned</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Remaining</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.rate]}>Rate</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.amount]}>Amount</Text>
  </View>
)

export const InvoiceTableSalesHeader = () => (
  <View style={[tableStyles.row, styles.container]} fixed>
    <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
      Item - Date
    </Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>Quantity</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.rate]}>Rate</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.discount]}>Discount</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.amount]}>Amount</Text>
  </View>
)