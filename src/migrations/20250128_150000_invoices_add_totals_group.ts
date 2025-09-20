import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  console.log('🔄 Starting migration: Add totals group to existing invoices');

  // Find all invoices that don't have the totals group
  const invoicesWithoutTotals = await db.find({
    totals: { $exists: false }
  }).toArray();

  console.log(`📊 Found ${invoicesWithoutTotals.length} invoices without totals group`);

  if (invoicesWithoutTotals.length === 0) {
    console.log('✅ No invoices need migration');
    return;
  }

  // Process each invoice to populate the totals group
  let processedCount = 0;
  let errorCount = 0;

  for (const invoice of invoicesWithoutTotals) {
    try {
      // Map existing fields to totals group structure
      const totals = {
        subtotal: invoice.netTotal || 0,
        discount: 0, // No discount logic currently implemented
        net: invoice.netTotal || 0,
        tax: 0, // No tax logic currently implemented
        previous: (invoice.previousBalance && invoice.previousBalance > 0) 
          ? invoice.previousBalance 
          : (invoice.previousAdvanceAmount || 0),
        total: invoice.dueAmount || 0,
        paid: invoice.paidAmount || 0,
        balance: (invoice.remainingAmount && invoice.remainingAmount > 0) 
          ? invoice.remainingAmount 
          : (invoice.advanceAmount || 0),
      };

      // Update the invoice with the totals group
      await db.updateOne(
        { _id: invoice._id },
        { $set: { totals } }
      );

      processedCount++;
      
      if (processedCount % 100 === 0) {
        console.log(`📈 Processed ${processedCount}/${invoicesWithoutTotals.length} invoices`);
      }
    } catch (error) {
      console.error(`❌ Error processing invoice ${invoice._id}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Migration completed:`);
  console.log(`   - Successfully processed: ${processedCount} invoices`);
  console.log(`   - Errors: ${errorCount} invoices`);
  console.log(`   - Total invoices: ${invoicesWithoutTotals.length}`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  console.log('🔄 Reverting migration: Remove totals group from invoices');

  // Remove the totals group from all invoices
  const result = await db.updateMany(
    { totals: { $exists: true } },
    { $unset: { totals: '' } }
  );

  console.log(`🧹 Removed totals group from ${result.modifiedCount} invoices`);
}
