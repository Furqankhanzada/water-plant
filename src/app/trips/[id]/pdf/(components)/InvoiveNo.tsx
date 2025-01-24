import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React, { Fragment } from 'react'
import { Invoice } from '@/payload-types'






const styles = StyleSheet.create({
    invoiceNoContainer: {
        flexDirection: 'row',
        marginTop: 36,
        justifyContent: 'flex-end',
    },
    invoiceDateContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    invoiceDate: {
        fontSize: 12,
        fontStyle: 'bold',
    },
    label: {
        width: 60,
    },
})

function InvoiveNo({ invoice }: { invoice: Invoice }) {


    return (
        <Fragment>
            <View style={styles.invoiceNoContainer}>
                <Text style={styles.label}>Invoice No:</Text>
                <Text >{invoice.id}</Text>
            </View>
            <View style={styles.invoiceDateContainer}>
                <Text style={styles.label}>Date: </Text>
                <Text>{format(invoice.createdAt, 'dd-MM-yyyy')}</Text>
            </View>
        </Fragment>
    )
}

export default InvoiveNo
