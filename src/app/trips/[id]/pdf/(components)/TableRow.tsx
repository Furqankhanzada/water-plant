import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Customer, Invoice } from '@/payload-types'
import { tableStyles } from './Table'

const styles = StyleSheet.create({
  name: {
    width: '20%',
  },
  address: {
    width: '20%',
  },
  delivered: {
    width: '10%',
  },
  returned: {
    width: '10%',
  },
  remaining: {
    width: '10%',
  },
  paymentReceived: {
    width: '15%',
  },
  paymentDue: {
    width: '15%',
  },
})

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

const TableRow = ({ customers }: { customers: Partial<Customer>[] }) => {
  const rows = customers.map((customer) => {
    const dueAmount = customer.invoice?.docs?.reduce((currentValue, invoice) => {
      invoice = invoice as Invoice
      return currentValue + invoice.dueAmount!
    }, 0)
    return (
      <View style={tableStyles.row} key={customer.id}>
        <Text style={[tableStyles.column, styles.name]}>{customer.name}</Text>
        <Text style={[tableStyles.column, styles.address]}>{customer.address}</Text>
        <Text style={[tableStyles.column, styles.delivered]}></Text>
        <Text style={[tableStyles.column, styles.returned]}></Text>
        <Text style={[tableStyles.column, styles.remaining]}></Text>
        <Text style={[tableStyles.column, styles.paymentReceived]}></Text>
        <Text style={[tableStyles.column, styles.paymentReceived]}>{rupee.format(dueAmount!)}</Text>
      </View>
    )
  })
  return <Fragment>{rows}</Fragment>
}

export default TableRow
