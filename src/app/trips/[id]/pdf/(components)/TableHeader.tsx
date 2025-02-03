import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { tableStyles } from './Table'

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  name: {
    width: '20%',
  },
  address: {
    width: '20%',
  },
  delivered: {
    width: '10%',
  },
  returned: {
    width: '10%',
  },
  remaining: {
    width: '10%',
  },
  paymentReceived: {
    width: '15%',
  },
  paymentDue: {
    width: '15%',
  },
})

const TableHeader = () => (
  <View style={[tableStyles.row, styles.container]} fixed>
    <Text style={[tableStyles.column, tableStyles.bold, styles.name]}>Name</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.address]}>Address</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.delivered]}>Delivered</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.returned]}>Returned</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.remaining]}>Remaining</Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.paymentReceived]}>
      Payment Received
    </Text>
    <Text style={[tableStyles.column, tableStyles.bold, styles.paymentReceived]}>Payment Due</Text>
  </View>
)

export default TableHeader
