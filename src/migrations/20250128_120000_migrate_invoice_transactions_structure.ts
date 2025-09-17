import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    const db = payload.db.collections.invoice.collection

    console.log('🔄 Starting migration: Converting invoice transactions from array of IDs to relation objects')

    // Find all invoices that have the old transactions structure (array of ObjectIds)
    const invoicesWithOldStructure = await db.find({
      transactions: { $exists: true, $type: 'array' },
      'transactions.0': { $type: 'objectId' } // First element is an ObjectId (old format)
    }).toArray()

    console.log(`📊 Found ${invoicesWithOldStructure.length} invoices with old transactions structure`)

    if (invoicesWithOldStructure.length === 0) {
      console.log('✅ No invoices found with old structure. Migration complete.')
      return
    }

    let updatedCount = 0
    let errorCount = 0

    for (const invoice of invoicesWithOldStructure) {
      try {
        // Transform old structure to new structure
        const newTransactions = invoice.transactions.map((transactionId: any) => ({
          relationTo: 'transaction',
          value: transactionId // Already an ObjectId, keep as is
        }))

        // Update the invoice with new structure
        await db.updateOne(
          { _id: invoice._id },
          {
            $set: {
              transactions: newTransactions
            }
          }
        )

        updatedCount++
        console.log(`✅ Updated invoice ${invoice._id} - converted ${invoice.transactions.length} transactions`)
      } catch (error) {
        console.error(`❌ Error updating invoice ${invoice._id}:`, error)
        errorCount++
      }
    }

    console.log(`🎉 Migration completed successfully!`)
    console.log(`✅ Updated: ${updatedCount} invoices`)
    console.log(`❌ Errors: ${errorCount} invoices`)

  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    const db = payload.db.collections.invoice.collection

    console.log('🔄 Reverting migration: Converting invoice transactions from relation objects back to array of IDs')

    // Find all invoices that have the new transactions structure (array of objects with relationTo and value)
    const invoicesWithNewStructure = await db.find({
      transactions: { $exists: true, $type: 'array' },
      'transactions.0.relationTo': { $exists: true } // First element has relationTo (new format)
    }).toArray()

    console.log(`📊 Found ${invoicesWithNewStructure.length} invoices with new transactions structure`)

    if (invoicesWithNewStructure.length === 0) {
      console.log('✅ No invoices found with new structure. Rollback complete.')
      return
    }

    let updatedCount = 0
    let errorCount = 0

    for (const invoice of invoicesWithNewStructure) {
      try {
        // Transform new structure back to old structure
        const oldTransactions = invoice.transactions.map((transactionObj: any) => {
          if (typeof transactionObj === 'object' && transactionObj.value) {
            // Value is already an ObjectId, keep as is
            return transactionObj.value
          }
          // Fallback: if it's already an ObjectId, keep it as is
          return transactionObj
        })

        // Update the invoice with old structure
        await db.updateOne(
          { _id: invoice._id },
          {
            $set: {
              transactions: oldTransactions
            }
          }
        )

        updatedCount++
        console.log(`✅ Reverted invoice ${invoice._id} - converted ${invoice.transactions.length} transactions`)
      } catch (error) {
        console.error(`❌ Error reverting invoice ${invoice._id}:`, error)
        errorCount++
      }
    }

    console.log(`🎉 Rollback completed successfully!`)
    console.log(`✅ Reverted: ${updatedCount} invoices`)
    console.log(`❌ Errors: ${errorCount} invoices`)

  } catch (error) {
    console.error('💥 Rollback failed:', error)
    throw error
  }
}
