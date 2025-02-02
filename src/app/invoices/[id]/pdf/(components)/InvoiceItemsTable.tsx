import React from 'react'
import { View, StyleSheet } from '@react-pdf/renderer'
import InvoiceTableHeader from './InvoiceTableHeader'
import InvoiceTableRow from './InvoiceTableRow'
import InvoiceTableBlankSpace from './InvoiceTableBlankSpace'
import InvoiceTableFooter from './InvoiceTableFooter'
import { Invoice } from '@/payload-types'

const generic = {
  borderColor: '#bff0fd',
  height: 20,
}

const genericColumn = {
  ...generic,
  paddingTop: 3,
  borderRightWidth: 1,
  fontSize: 9,
  fontFamily: 'Helvetica',
}

export const tableStyles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    ...generic,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  column: {
    ...genericColumn,
    textAlign: 'left',
    paddingLeft: 8,
    paddingRight: 8,
  },
})

const InvoiceItemsTable = ({ invoice }: { invoice: Invoice }) => {
  return (
    <View style={tableStyles.tableContainer}>
      <InvoiceTableHeader />
      <InvoiceTableRow invoice={invoice} />
      <InvoiceTableBlankSpace rowsCount={2} />
      <InvoiceTableFooter invoice={invoice} />
    </View>
  )
}

export default InvoiceItemsTable
