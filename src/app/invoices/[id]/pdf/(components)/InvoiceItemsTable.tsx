import React from 'react'
import { Invoice } from '@/payload-types'
import { View, StyleSheet } from '@react-pdf/renderer'

import InvoiceTableHeader from './InvoiceTableHeader'
import InvoiceTableRow from './InvoiceTableRow'
import InvoiceTableBlankSpace from './InvoiceTableBlankSpace'
import InvoiceTableFooter from './InvoiceTableFooter'

const tableRowsCount = 11

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bff0fd',
  },
})

const InvoiceItemsTable = ({ invoice }: { invoice: Invoice }) => (
  <View style={styles.tableContainer}>
    <InvoiceTableHeader />
    <InvoiceTableRow invoice={invoice} />
    <InvoiceTableBlankSpace rowsCount={tableRowsCount - invoice.transactions.length} />
    <InvoiceTableFooter invoice={invoice} />
  </View>
)

export default InvoiceItemsTable
