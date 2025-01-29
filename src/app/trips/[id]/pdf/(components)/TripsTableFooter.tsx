import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Transaction, Trip } from '@/payload-types'


const borderColor = '#3e85c5'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 'auto',
        fontSize: 12,
        backgroundColor: '#fff',
        paddingVertical: 2

    },
    description: {
        width: '84.6%',
        textAlign: 'right',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        paddingRight: 8,
        paddingLeft: 8,
        fontSize: 12,
        color: borderColor,
    },
    total: {
        width: '15.4%',
        textAlign: 'center',
        paddingRight: 8,
        fontSize: 12,
        color: borderColor,

    },
})


function TripsTableFooter({ invoice }: { invoice: Trip }) {
    const totalAmount = invoice.transaction?.docs?.reduce((sum, transaction) => {
        sum = sum as number
        transaction = transaction as Transaction
        return sum + transaction.total
    }, 0)

    return (
        <View style={styles.row}>
            <Text style={styles.description}>TOTAL</Text>
            <Text style={styles.total}></Text>
        </View>
    )
}

export default TripsTableFooter


