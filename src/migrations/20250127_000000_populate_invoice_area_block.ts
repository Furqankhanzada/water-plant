import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'
import { Types } from 'mongoose'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    const db = payload.db.collections.invoice.collection

    // Get all existing invoices that don't have area or block
    const invoices = await db.find({
      $or: [
        { area: { $exists: false } },
        { block: { $exists: false } }
      ]
    }).toArray()

    console.log(`Found ${invoices.length} invoices to update`)

    let updatedCount = 0
    for (const invoice of invoices) {
      if (invoice.customer) {
        try {
          // Fetch customer data
          const customer = await payload.findByID({
            collection: 'customers',
            id: invoice.customer.toString(),
            depth: 0,
            select: {
              area: true,
              block: true,
            },
          })

          if (customer && (customer.area || customer.block)) {
            // Update invoice with area and block from customer
            await db.updateOne(
              { _id: invoice._id },
              {
                $set: {
                  area: customer.area ? new Types.ObjectId(customer.area as string) : null,
                  block: customer.block ? new Types.ObjectId(customer.block as string) : null,
                }
              }
            )
            updatedCount++
          }
        } catch (error) {
          console.error(`Error updating invoice ${invoice._id}:`, error)
        }
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} invoices with area and block fields`)
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    const db = payload.db.collections.invoice.collection

    console.log('🔄 Reverting migration: removing area and block fields')

    const result = await db.updateMany(
      {
        $or: [
          { area: { $exists: true } },
          { block: { $exists: true } }
        ]
      },
      {
        $unset: {
          area: '',
          block: ''
        }
      }
    )

    console.log(`🧹 Removed area and block fields from ${result.modifiedCount} invoices`)
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
