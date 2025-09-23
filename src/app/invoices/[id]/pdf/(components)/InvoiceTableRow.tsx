import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice, Sale, Transaction } from '@/payload-types'
import { format } from 'date-fns'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  description: {
    width: '40%',
  },
  qty: {
    width: '12.66%',
    textAlign: 'right',
  },
  rate: {
    width: '10%',
    textAlign: 'right',
  },
  amount: {
    width: '12%',
    textAlign: 'right',
  },
  discount: {
    width: '25.34%',
    textAlign: 'right',
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export const InvoiceTableTransactionRows = ({ invoice }: { invoice: Invoice }) => {
  let transaction: Transaction
  const transactionsRows = invoice.transactions.map((item, i) => {
    if (item.relationTo === 'transaction' && typeof item.value !== 'string' ) {
      transaction = item.value as Transaction
    } else return null
    const rate = isNaN(transaction.total / transaction.bottleGiven) ? 0 : transaction.total / transaction.bottleGiven
    return (
      <View style={tableStyles.row} key={transaction.id} break={i === 30}>
        <Text style={[tableStyles.column, styles.description]}>
          19 Liter Bottles - {format(transaction.transactionAt, 'EEE, MMM dd	yyyy')}
        </Text>
        <Text style={[tableStyles.column, styles.qty]}>+{transaction.bottleGiven}</Text>
        <Text style={[tableStyles.column, styles.qty]}>-{transaction.bottleTaken}</Text>
        <Text style={[tableStyles.column, styles.qty]}>{transaction.remainingBottles}</Text>
        <Text style={[tableStyles.column, styles.rate]}>{rupee.format(rate)}</Text>
        <Text style={[tableStyles.column, styles.amount]}>{rupee.format(transaction.total)}</Text>
      </View>
    )
  })

  return <Fragment>{transactionsRows}</Fragment>
}


export const InvoiceTableSalesRows = ({ invoice }: { invoice: Invoice }) => {
  let sale: Sale
  const salesRows = invoice.transactions.map((item, i) => {
    if (item.relationTo === 'sales' && typeof item.value !== 'string' ) {
      sale = item.value as Sale
    } else return null
    return (
      <View style={tableStyles.row} key={sale.id} break={i === 30}>
        <Text style={[tableStyles.column, styles.description]}>
          {sale.item.product} - {format(sale.date!, 'EEE, MMM dd	yyyy')}
        </Text>
        <Text style={[tableStyles.column, styles.qty]}>+{sale.item.quantity}</Text>
        <Text style={[tableStyles.column, styles.rate]}>{rupee.format(sale.item.unitPrice || 0)}</Text>
        <Text style={[tableStyles.column, styles.discount]}>{sale.totals?.discount}</Text>
        <Text style={[tableStyles.column, styles.amount]}>{rupee.format(sale.totals?.gross || 0)}</Text>
      </View>
    )
  })

  return <Fragment>{salesRows}</Fragment>
}
