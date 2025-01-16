import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  reportTitle: {
    color: '#61dafb',
    letterSpacing: 4,
    fontSize: 25,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
})

const InvoiceTitle = ({ title }: { title: string }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.reportTitle}>{title}</Text>
  </View>
)

export default InvoiceTitle
