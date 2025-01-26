
import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Trip } from '@/payload-types'


const borderColor = ''
const bgColor = '#3e85c5'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
        width: '100%',
        flexGrow: 1,
        textAlign: 'center',

    },
    container: {
        marginTop: '30',
        width: '100%',
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        // backgroundColor: '#bff0fd',
        borderBottomWidth: 1,
        // alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
        flexGrow: 1,
    },
    description: {
        width: '26.6%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: bgColor,
        paddingTop: 4,
        fontSize: 10,
        paddingLeft: 2
    },
    qty: {
        width: '12%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: bgColor,
        paddingTop: 4


    },
    rate: {
        width: '16.6%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: bgColor,
        paddingTop: 4


    },
    amount: {
        width: '16.6%',
        color: bgColor,
        paddingTop: 4
    },
})



function TripsTableRow({ invoice, customerData }: { invoice: Trip, customerData: any }) {

    const rows = invoice.transaction?.docs?.map((item: any, i: number) => {
        console.log(customerData.docs[i]?.name);
        return (
            <View style={styles.row} key={item.id}>
                <Text style={styles.description}>{customerData.docs[i]?.name || "unkown"}</Text>
                <Text style={styles.rate}>{item.status}</Text>
                <Text style={styles.qty}>{item.bottleGiven}</Text>
                <Text style={styles.qty}>{item.bottleTaken}</Text>
                <Text style={styles.qty}>{item.remainingBottles}</Text>
                <Text style={styles.amount}>{item.total}</Text>
            </View>
        )
    })
    return <Fragment>{rows}</Fragment>
}

export default TripsTableRow
