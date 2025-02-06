import { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Customer, Invoice } from '@/payload-types'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  invoiceNoContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  invoiceDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  invoiceDate: {
    fontSize: 7,
  },
  label: {
    textAlign: 'right',
    fontSize: 7,
    width: 60,
    paddingRight: 5,
  },
})

const InvoiceNo = ({ invoice }: { invoice: Invoice }) => {
  const customer = invoice.customer as Customer
  return (
    <Fragment>
      <View style={styles.invoiceNoContainer}>
        <Text style={styles.label}>Customer ID:</Text>
        <Text style={styles.invoiceDate}>{customer.id}</Text>
      </View>
      <View style={styles.invoiceDateContainer}>
        <Text style={styles.label}>Invoice No:</Text>
        <Text style={styles.invoiceDate}>{invoice.id}</Text>
      </View>
      <View style={styles.invoiceDateContainer}>
        <Text style={styles.label}>Date: </Text>
        <Text style={styles.invoiceDate}>{format(invoice.createdAt, 'dd-MM-yyyy')}</Text>
      </View>
    </Fragment>
  )
}

export default InvoiceNo
