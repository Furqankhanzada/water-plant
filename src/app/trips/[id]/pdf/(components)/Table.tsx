import React from 'react'
import { View, StyleSheet } from '@react-pdf/renderer'
import TableHeader from './TableHeader'
import TableRow from './TableRow'
import { Customer, Transaction } from '@/payload-types'

const generic = {
  borderColor: '#bff0fd',
  height: 16,
}

const genericColumn = {
  ...generic,
  paddingTop: 3,
  borderRightWidth: 1,
  fontSize: 7,
  fontFamily: 'Helvetica',
}

export const tableStyles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bold: {
    fontFamily: 'Times-Bold',
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

const InvoiceItemsTable = ({
  blockTransactions,
}: {
  blockTransactions: Partial<Transaction>[]
}) => {
  return (
    <View style={tableStyles.tableContainer}>
      <TableHeader />
      <TableRow customers={blockTransactions.map((t) => t.customer as Customer)} />
    </View>
  )
}

export default InvoiceItemsTable
