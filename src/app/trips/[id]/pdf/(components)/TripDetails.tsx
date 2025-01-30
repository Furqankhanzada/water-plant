import { Transaction, Trip } from '@/payload-types'
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

const styles = StyleSheet.create({
    deatilsWrapper: {
        marginBottom: 10,
        textAlign: 'center',
        width: '100%'
    },
    tripDetails: {
        color: 'black',
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 5,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
})
 
function TripDetails({ invoice }: { invoice: Trip | any }) {
    return (
        <View style={styles.deatilsWrapper}>
            <Text style={styles.tripDetails}>{invoice.area.name}</Text>
        </View>
    )
}  

export default TripDetails
