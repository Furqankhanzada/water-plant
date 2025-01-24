import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'


const borderColor = '#3e85c5'
const bgColor = '#3e85c5'
const styles = StyleSheet.create({
    container: {
        // marginTop: '30',
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
        backgroundColor: bgColor,
        color: '#fff',
        paddingTop: 4,
        borderTopLeftRadius: 16
    },
    qty: {
        width: '12%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        backgroundColor: bgColor,
        color: 'white',
        paddingTop: 4


    },
    rate: {
        width: '16.6%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        backgroundColor: bgColor,
        color: 'white',
        paddingTop: 4


    },
    amount: {
        width: '20.6%',
        backgroundColor: bgColor,
        color: 'white',
        paddingTop: 4,
        borderTopRightRadius: 16
    },
})


function TripsTableHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.description}>id</Text>
            <Text style={styles.rate}>status</Text>
            <Text style={styles.qty}>G/bottels</Text>
            <Text style={styles.qty}>T/bottels</Text>
            <Text style={styles.qty}>R/bottles</Text>
            <Text style={styles.amount}>Total</Text>
        </View>
    )
}

export default TripsTableHeader
