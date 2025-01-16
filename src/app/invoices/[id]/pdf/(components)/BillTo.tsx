import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice } from '@/payload-types'

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 36,
  },
  billTo: {
    marginTop: 20,
    paddingBottom: 3,
    fontFamily: 'Helvetica-Oblique',
  },
})

const BillTo = ({ invoice }: { invoice: Invoice }) => {
  if (typeof invoice.customer === 'string') return null

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.billTo}>Bill To:</Text>
      <Text>{invoice.customer.name}</Text>
      <Text>{`${invoice.customer.address} ${invoice.customer.block.name} ${invoice.customer.area.name}`}</Text>
      <Text>{invoice.customer?.contactNumbers?.[0]?.contactNumber}</Text>
      {/* <Text>{invoice.email}</Text> */}
    </View>
  )
}

export default BillTo
