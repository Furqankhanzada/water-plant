import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'


/**
 * Migration: Migrate Embedded Payments to Payment Collection
 * 
 * This migration:
 * 1. Finds all invoices with embedded payment data in the `payments` array
 * 2. Creates separate Payment documents for each embedded payment
 * 3. Updates invoices to reference the new Payment documents
 * 4. Removes the embedded payment data from invoices
 * 
 * Note: Transactions no longer have embedded payments (already removed)
 */

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('🚀 Starting payment migration...')
  
  const invoiceCollection = payload.db.collections.invoice.collection
  const paymentCollection = payload.db.collections.payments.collection

  // Find all invoices with embedded payments (old structure)
  const invoicesWithPayments = await invoiceCollection.find({
    payments: { 
      $exists: true, 
      $type: 'array',
      $ne: [] 
    }
  }).toArray()

  console.log(`📦 Found ${invoicesWithPayments.length} invoices with embedded payments`)

  let totalPaymentsCreated = 0
  let totalInvoicesUpdated = 0

  for (const invoice of invoicesWithPayments) {
    const payments = invoice.payments || []
    
    // Skip if payments is already an array of IDs (new structure)
    if (payments.length > 0 && typeof payments[0] === 'string') {
      console.log(`⏭️  Invoice ${invoice._id} already migrated (has payment IDs)`)
      continue
    }

    // Skip if payments is empty or not an array of objects
    if (!Array.isArray(payments) || payments.length === 0 || typeof payments[0] !== 'object') {
      continue
    }

    const paymentIds: any[] = []

    // Create Payment documents for each embedded payment
    for (const embeddedPayment of payments) {
      try {
        const paymentDoc = {
          customer: invoice.customer,
          invoice: invoice._id,
          type: embeddedPayment.type || 'cash',
          amount: embeddedPayment.amount || 0,
          paidAt: embeddedPayment.paidAt || new Date(),
          comments: embeddedPayment.comments || '',
          trip: embeddedPayment.trip || null,
          createdAt: invoice.createdAt || new Date(),
          updatedAt: new Date(),
        }

        // Only create payment if amount > 0
        if (paymentDoc.amount > 0) {
          const result = await paymentCollection.insertOne(paymentDoc)
          paymentIds.push(result.insertedId)
          totalPaymentsCreated++
        }
      } catch (error) {
        console.error(`❌ Error creating payment for invoice ${invoice._id}:`, error)
      }
    }

    // Update invoice to reference the new Payment documents
    if (paymentIds.length > 0) {
      await invoiceCollection.updateOne(
        { _id: invoice._id },
        { $set: { payments: paymentIds } }
      )
      totalInvoicesUpdated++
      console.log(`✅ Invoice ${invoice._id}: Created ${paymentIds.length} payment(s)`)
    } else {
      // No valid payments, set to empty array
      await invoiceCollection.updateOne(
        { _id: invoice._id },
        { $set: { payments: [] } }
      )
    }
  }

  console.log(`\n🎉 Migration complete!`)
  console.log(`   - Created ${totalPaymentsCreated} Payment documents`)
  console.log(`   - Updated ${totalInvoicesUpdated} invoices`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting payment migration...')
  
  const invoiceCollection = payload.db.collections.invoice.collection
  const paymentCollection = payload.db.collections.payments.collection

  // Find all invoices with payment references (new structure)
  const invoicesWithPaymentRefs = await invoiceCollection.find({
    payments: { 
      $exists: true, 
      $type: 'array',
      $ne: [] 
    }
  }).toArray()

  console.log(`📦 Found ${invoicesWithPaymentRefs.length} invoices to revert`)

  let totalPaymentsDeleted = 0
  let totalInvoicesReverted = 0

  for (const invoice of invoicesWithPaymentRefs) {
    const paymentIds = invoice.payments || []
    
    // Skip if payments is already embedded (old structure)
    if (paymentIds.length > 0 && typeof paymentIds[0] === 'object') {
      console.log(`⏭️  Invoice ${invoice._id} already has embedded payments`)
      continue
    }

    // Skip if not an array of ObjectIds
    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      continue
    }

    // Fetch Payment documents
    const payments = await paymentCollection.find({
      _id: { $in: paymentIds }
    }).toArray()

    if (payments.length > 0) {
      // Convert Payment documents back to embedded format
      const embeddedPayments = payments.map(payment => ({
        type: payment.type,
        amount: payment.amount,
        paidAt: payment.paidAt,
        comments: payment.comments || '',
        trip: payment.trip || null,
      }))

      // Update invoice with embedded payments
      await invoiceCollection.updateOne(
        { _id: invoice._id },
        { $set: { payments: embeddedPayments } }
      )

      // Delete Payment documents
      await paymentCollection.deleteMany({
        _id: { $in: payments.map(p => p._id) }
      })

      totalPaymentsDeleted += payments.length
      totalInvoicesReverted++
      console.log(`✅ Invoice ${invoice._id}: Reverted ${payments.length} payment(s)`)
    }
  }

  console.log(`\n🎉 Rollback complete!`)
  console.log(`   - Deleted ${totalPaymentsDeleted} Payment documents`)
  console.log(`   - Reverted ${totalInvoicesReverted} invoices to embedded structure`)
}

