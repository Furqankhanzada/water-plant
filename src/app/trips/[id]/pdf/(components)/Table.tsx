import React from 'react'
import { View, StyleSheet } from '@react-pdf/renderer'

import { Transaction, Trip } from '@/payload-types'
import TableHeader from './TableHeader'
import TableRow from './TableRow'

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
  trip,
}: {
  blockTransactions: Partial<Transaction>[]
  trip: Partial<Trip>
}) => {
  return (
    <View style={tableStyles.tableContainer}>
      <TableHeader />
      <TableRow trip={trip} blockTransactions={blockTransactions} />
    </View>
  )
}

export default InvoiceItemsTable
