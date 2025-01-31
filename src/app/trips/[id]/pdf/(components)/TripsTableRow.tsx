
import React, { Fragment } from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { Transaction, Trip } from '@/payload-types'


const borderColor = '#e1e1e1'
const bgColor = '#3e85c5'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#e1e1e1',
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
        borderBottomColor: '#e1e1e1',
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
        color: "black",
        paddingTop: 4,
        fontSize: 8,
        height :"100%",
        textAlign : 'left',
        paddingLeft : 3
    },
    address: {
        width: '30%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: "black",
        paddingTop: 4,
        height :"100%",
        textAlign : 'left',
        paddingLeft : 3
    },
    rate: {
        width: '13.6%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: "black",
        paddingTop: 4,
        // height : 'fitContent'
        height :"100%",
        textAlign : 'left',
        paddingLeft : 3
    },
    amount: {
        width: '11.6%',
        color: "black",
        paddingTop: 4,
        borderRightWidth: 1,
        borderRightColor: borderColor,
        height :"100%",
        textAlign : 'left',
        paddingLeft : 3

    },
    amount1: {
        width: '10.6%',
        color: "black",
        paddingTop: 4,
        height :"100%",
        textAlign : 'left',
        paddingLeft : 3
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
