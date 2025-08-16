import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'
import { Types } from 'mongoose'

const { ObjectId } = Types

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  const invoicesCollection = payload.db.collections.invoice.collection
  const customersCollection = payload.db.collections.customers.collection

  console.log('🔄 Starting invoice customer field restructure migration...')

  try {
    // Get all existing invoices
    const invoices = await invoicesCollection.find({}).toArray()
    console.log(`📋 Found ${invoices.length} invoices to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const invoice of invoices) {
      try {
        const updateCustomer: any = {}
        let needsUpdate = false

        // 1. Restructure customer field if it's a simple string/relationship
        if (invoice.customer && invoice.customer instanceof ObjectId) {
          const customer = await customersCollection.findOne({
            _id: invoice.customer,
          })
          if (!customer) {
            console.error(`❌ Customer not found for invoice ${invoice._id}`)
            continue
          }
          // Old format: customer was just a string ID
          updateCustomer.customer = {
            id: customer._id,
            address: customer.address,
            area: customer.area,
            block: customer.block,
          }
          needsUpdate = true
          // console.log(`🔄 Restructuring customer field for invoice ${invoice._id}`)
        } else {
          // console.log('❌ invoice.customer instanceof ObjectId',  invoice.customer instanceof ObjectId)
        }

        // 2. Update the document if changes are needed
        if (needsUpdate) {
          await invoicesCollection.updateOne({ _id: invoice._id }, { $set: updateCustomer })
          migratedCount++
          console.log(`✅ Migrated invoice ${invoice._id}`)
        } else {
          skippedCount++
        }
      } catch (error) {
        console.error(`❌ Error migrating invoice ${invoice._id}:`, (error as Error).message)
      }
    }

    console.log(`🎉 Migration completed successfully!`)
    console.log(`✅ Migrated: ${migratedCount} invoices`)
    console.log(`⏭️ Skipped: ${skippedCount} invoices (already up to date)`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  const invoicesCollection = payload.db.collections.invoice.collection

  console.log('🔄 Reverting invoice customer field restructure migration...')

  try {
    // Get all invoices with the new customer structure
    const invoices = await invoicesCollection.find({}).toArray()
    console.log(`📋 Found ${invoices.length} invoices to revert`)

    let revertedCount = 0

    for (const invoice of invoices) {
      try {
        let needsUpdate = false

        // Only revert customer field if it's a group structure
        if (invoice.customer && invoice.customer.id instanceof ObjectId) {
          // Revert customer field back to simple string ID
          await invoicesCollection.updateOne(
            { _id: invoice._id },
            { $set: { customer: invoice.customer.id } },
          )
          needsUpdate = true
          console.log(`🔄 Reverted customer field for invoice ${invoice._id}`)
        }

        if (needsUpdate) {
          revertedCount++
        }
      } catch (error) {
        console.error(`❌ Error reverting invoice ${invoice._id}:`, (error as Error).message)
      }
    }

    console.log(`🎉 Reversion completed successfully!`)
    console.log(`🔄 Reverted: ${revertedCount} invoices`)
  } catch (error) {
    console.error('❌ Reversion failed:', error)
    throw error
  }
}
