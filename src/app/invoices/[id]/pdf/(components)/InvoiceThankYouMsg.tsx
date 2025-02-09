import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  reportTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
})

const InvoiceThankYouMsg = ({ message }: { message: string }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.reportTitle}>{message}</Text>
  </View>
)

export default InvoiceThankYouMsg
