import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Area, Block, Customer, Invoice } from '@/payload-types'

import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 10,
  },
  billTo: {
    paddingBottom: 3,
    fontFamily: 'Helvetica-Oblique',
  },
})

const BillTo = ({ invoice }: { invoice: Invoice }) => {
  const customer = invoice.customer as Customer
  const block = customer.block as Block
  const area = customer.area as Area

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.billTo}>Bill To:</Text>
      <Text style={tableStyles.bold}>{customer.name}</Text>
      <Text>{`${customer.address} ${block.name} ${area.name}`}</Text>
      <Text>{customer.contactNumbers?.[0]?.contactNumber}</Text>
      {/* <Text>{invoice.email}</Text> */}
    </View>
  )
}

export default BillTo
