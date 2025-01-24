import { Trip } from '@/payload-types'
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

const styles = StyleSheet.create({
    deatilsWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    tripDetails: {
        color: 'black',
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    tripDetailValue: {
        fontSize: 12,
        textDecoration: 'underline',
        fontStyle: 'italic'
    }
})

function TripDetails({ invoice }: { invoice: Trip | any }) {
    return (
        <View style={styles.deatilsWrapper}>
            <Text style={styles.tripDetails}>Trip From <Text style={{ fontWeight: 700 }}>::</Text> <Text style={styles.tripDetailValue}>{invoice.from}</Text> </Text>
            <Text style={styles.tripDetails}>To <Text style={{ fontWeight: 700 }}>::</Text> <Text style={styles.tripDetailValue}>{invoice.area.name}</Text> </Text>
            <Text style={styles.tripDetails}>Invoice No <Text style={{ fontWeight: 700 }}>::</Text> <Text style={styles.tripDetailValue}>{invoice.id}</Text> </Text>
            <Text style={styles.tripDetails}>Date <Text style={{ fontWeight: 700 }}>::</Text> <Text style={styles.tripDetailValue}>{format(invoice.createdAt, 'dd-MM-yyyy')}</Text> </Text>
            <Text style={styles.tripDetails}>Employee <Text style={{ fontWeight: 700 }}>::</Text> <Text style={styles.tripDetailValue}>{invoice.employee[0]?.name}</Text> </Text>
        </View>
    )
}

export default TripDetails
