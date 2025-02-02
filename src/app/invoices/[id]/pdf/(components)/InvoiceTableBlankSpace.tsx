import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
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

const InvoiceTableBlankSpace = ({ rowsCount }: { rowsCount: number }) => {
  const blankRows = Array(rowsCount).fill(0)
  const rows = blankRows.map((x, i) => (
    <View style={tableStyles.row} key={`BR${i}`}>
      <Text style={[tableStyles.column, styles.description]} />
      <Text style={[tableStyles.column, styles.qty]} />
      <Text style={[tableStyles.column, styles.qty]} />
      <Text style={[tableStyles.column, styles.rate]} />
      <Text style={[tableStyles.column, styles.amount]} />
    </View>
  ))
  return <Fragment>{rows}</Fragment>
}

export default InvoiceTableBlankSpace
