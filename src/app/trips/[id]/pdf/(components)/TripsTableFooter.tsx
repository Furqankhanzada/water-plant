import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'


const borderColor = '#3e85c5'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 30,
        fontSize: 12,
        backgroundColor: borderColor,
        borderBottomRightRadius: 16,
        borderBottomLeftRadius: 16
    },
    description: {
        width: '79%',
        textAlign: 'left',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        paddingRight: 8,
        paddingLeft: 8,
        fontSize: 12,
        color: '#fff',
    },
    total: {
        width: '21%',
        textAlign: 'center',
        paddingRight: 8,
        fontSize: 12,
        color: '#fff',

    },
})


function TripsTableFooter({ invoice }: { invoice: any }) {
    const totalAmount = invoice.transaction.docs?.reduce((sum: any, transaction: any) => {
        return sum + transaction.total
    }, 0)

    return (
        <View style={styles.row}>
            <Text style={styles.description}>TOTAL</Text>
            <Text style={styles.total}>{Number(totalAmount)}</Text>
        </View>
    )
}

export default TripsTableFooter


