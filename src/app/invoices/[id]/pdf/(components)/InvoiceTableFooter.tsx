import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice, Transaction } from '@/payload-types'

const borderColor = '#90e5fc'
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    fontSize: 12,
    fontStyle: 'bold',
  },
  description: {
    width: '88%',
    textAlign: 'right',
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingRight: 8,
  },
  total: {
    width: '12%',
    textAlign: 'right',
    paddingRight: 8,
    fontWeight: 'bold',
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
      <View style={styles.row}>
        <Text style={styles.description}>Previous Balance</Text>
        <Text style={styles.total}>{rupee.format(invoice.previousBalance!)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.description}>Total</Text>
        <Text style={styles.total}>{rupee.format(invoice.dueAmount!)}</Text>
      </View>
    </>
  )
}

export default InvoiceTableFooter
