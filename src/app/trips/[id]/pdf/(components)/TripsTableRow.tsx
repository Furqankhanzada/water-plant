
import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Transaction, Trip } from '@/payload-types'


const borderColor = '#3e85c5'
const bgColor = '#3e85c5'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 'auto',
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
        width: '12%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: bgColor,
        paddingTop: 4,
        fontSize: 10,
        paddingLeft: 2

    },
    address: {
        width: '30%',
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
        width: '10.6%',
        color: bgColor,
        paddingTop: 4,
        borderRightWidth: 1,
        borderRightColor: borderColor,
        height: 24
    },
    amount1: {
        width: '10.6%',
        color: bgColor,
        paddingTop: 4,
        height: 24
    },
})

function TripsTableRow({ invoice, customerData }: { invoice: Trip, customerData: any }) {

    const rows = invoice.transactions?.docs?.map((item, i: number) => {
        item = item as Transaction
        console.log("item",item);
        return (
            <View style={styles.row} key={item.id}>
                <Text style={styles.description}>{customerData.docs[i]?.name || "unkown"}</Text>
                <Text style={styles.rate}>{customerData.docs[i].contactNumbers?.[0]?.contactNumber}</Text>
                <Text style={styles.address}>{customerData.docs[i].address} ,{customerData.docs[i].area?.name}</Text>
                <Text style={styles.amount}></Text>
                <Text style={styles.amount}></Text>
                <Text style={styles.amount}></Text>
                <Text style={styles.amount}></Text>
                <Text style={styles.amount1}></Text>
            </View>
        )
    })
    return <Fragment>{rows}</Fragment>
}

export default TripsTableRow
