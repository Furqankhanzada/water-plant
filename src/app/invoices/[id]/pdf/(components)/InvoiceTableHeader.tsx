import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'

const borderColor = '#90e5fc'
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    backgroundColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    textAlign: 'center',
    fontStyle: 'bold',
    flexGrow: 1,
  },
  description: {
    width: '50%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  qty: {
    width: '15%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  rate: {
    width: '12%',
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  amount: {
    width: '12%',
  },
})

const InvoiceTableHeader = () => (
  <View style={styles.container}>
    <Text style={styles.description}>Item - Delivery Date</Text>
    <Text style={styles.qty}>Returned Qty</Text>
    <Text style={styles.qty}>Delivered Qty</Text>
    <Text style={styles.rate}>Rate</Text>
    <Text style={styles.amount}>Amount</Text>
  </View>
)

export default InvoiceTableHeader
