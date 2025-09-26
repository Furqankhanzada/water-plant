import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice } from '@/payload-types'
import { tableStyles } from './InvoiceItemsTable'

const styles = StyleSheet.create({
  description2: {
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
  description: {
    width: '88%',
    textAlign: 'right',
  },
  total: {
    width: '12%',
    textAlign: 'right',
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const InvoiceTableFooter = ({ invoice }: { invoice: Invoice }) => {
  const totalBottlesCounts = invoice.transactions.reduce((total, item) => {
    if (item.relationTo === 'transaction' && typeof item.value !== 'string' ) {
      return total + item.value.bottleGiven
    }
    if (item.relationTo === 'sales' && typeof item.value !== 'string' ) {
      return total + (item.value.item.quantity || 0)
    }
    return total
  }, 0)
  return (
    <>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description2]}>
          Total Bottles Delivered/Filled
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>{totalBottlesCounts}</Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.qty]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.rate]} />
        <Text style={[tableStyles.column, tableStyles.bold, styles.amount]} />
      </View>
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
          Subtotal
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.totals?.subtotal || 0)}
        </Text>
      </View>
      {invoice.totals?.previous ? (
        <View style={tableStyles.row}>
          <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
            Previous Balance
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.totals?.previous || 0)}
          </Text>
        </View>
      ) : null}
      {invoice.totals?.discount ? (
        <View style={tableStyles.row}>
          <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
            Discount
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.totals?.discount || 0)}
          </Text>
        </View>
      ) : null}
            {invoice.totals?.tax ? (
        <View style={tableStyles.row}>
          <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
            Tax
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.totals?.tax || 0)}
          </Text>
        </View>
      ) : null}
      {invoice.lost?.count && invoice.lost.amount ? (
        <View style={tableStyles.row}>
          <Text
            style={[tableStyles.column, tableStyles.bold, styles.description, { width: '66%' }]}
          >
            Lost/Damaged Bottles
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.qty]}>
            {invoice.lost.count}
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.rate]}>
            {rupee.format(invoice.lost.amount)}
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.lost.count * invoice.lost.amount)}
          </Text>
        </View>
      ) : null}
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>Total</Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {rupee.format(invoice.totals?.total || 0)}
        </Text>
      </View>
      {invoice.totals?.paid ? (
        <View style={tableStyles.row}>
          <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
            Paid Amount
          </Text>
          <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
            {rupee.format(invoice.totals?.paid || 0)}
          </Text>
        </View>
      ) : null}
      <View style={tableStyles.row}>
        <Text style={[tableStyles.column, tableStyles.bold, styles.description]}>
          Balance
        </Text>
        <Text style={[tableStyles.column, tableStyles.bold, styles.total]}>
          {invoice.status !== 'paid' && invoice.totals?.paid
            ? rupee.format((invoice.totals?.total || 0) - (invoice.totals?.paid || 0))
            : rupee.format(invoice.totals?.balance || 0)}
        </Text>
      </View>
    </>
  )
}

export default InvoiceTableFooter
