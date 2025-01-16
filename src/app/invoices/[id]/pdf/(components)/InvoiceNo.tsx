import { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice } from '@/payload-types'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  invoiceNoContainer: {
    flexDirection: 'row',
    marginTop: 36,
    justifyContent: 'flex-end',
  },
  invoiceDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  invoiceDate: {
    fontSize: 12,
    fontStyle: 'bold',
  },
  label: {
    width: 60,
  },
})

const InvoiceNo = ({ invoice }: { invoice: Invoice }) => (
  <Fragment>
    <View style={styles.invoiceNoContainer}>
      <Text style={styles.label}>Invoice No:</Text>
      <Text style={styles.invoiceDate}>{invoice.id}</Text>
    </View>
    <View style={styles.invoiceDateContainer}>
      <Text style={styles.label}>Date: </Text>
      <Text>{format(invoice.createdAt, 'dd-MM-yyyy')}</Text>
    </View>
  </Fragment>
)

export default InvoiceNo
