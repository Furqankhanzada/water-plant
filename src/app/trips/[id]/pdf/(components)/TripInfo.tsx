import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Trip } from '@/payload-types'

import { format } from 'date-fns'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    fontSize: 9,
  },
  label: {
    marginRight: 4,
  },
})

const TripInfo = ({ trip }: { trip: Trip }) => {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Date:</Text>
        <Text>{format(trip.tripAt, 'EEE, MMM dd	yyyy')}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Total Bottles:</Text>
        <Text>{trip.bottles}</Text>
      </View>
    </>
  )
}

export default TripInfo
