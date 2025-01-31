import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'


const borderColor = '#fff'
const bgColor = '#3e85c5'
const styles = StyleSheet.create({
    container: {
        // marginTop: '30',
        width: '100%',
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        backgroundColor: bgColor,
        borderBottomWidth: 1,
        // alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
        flexGrow: 1,
        color: '#fff'



    },
    description: {
        width: '12%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: "#fff",
        paddingTop: 4,
        fontSize: 8,
        textAlign : 'left',
        paddingLeft : 3

    },
    address: {
        width: '30%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: "#fff",
        paddingTop: 4,
        textAlign : 'left',
        paddingLeft : 3
    },
    rate: {
        width: '13.6%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        color: "#fff",
        paddingTop: 4,
        textAlign : 'left',
        paddingLeft : 3

    },
    amount: {
        width: '11.6%',
        color: "#fff",
        paddingTop: 4,
        borderRightColor: borderColor,
        borderRightWidth: 1,
        textAlign : 'left',
        paddingLeft : 3

    },
    amount1: {
        width: '10.6%',
        color: "#fff",
        paddingTop: 4,
        textAlign : 'left',
        paddingLeft : 3

    },
})


function TripsTableHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.description}>Name</Text>
            <Text style={styles.rate}>Contact</Text>
            <Text style={styles.address}>Address</Text>
            <Text style={styles.amount}>Given Bottles</Text>
            <Text style={styles.amount}>Taken Bottles</Text>
            <Text style={styles.amount}>Remain Bottles</Text>
            <Text style={styles.amount}>Recive Amount</Text>
            <Text style={styles.amount1}>Due Amount</Text>
        </View>
    )
}

export default TripsTableHeader
