import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  console.log('🔄 Starting migration: Add totals group to existing invoices and migrate lost bottles to group structure');

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
  let lostBottlesMigratedCount = 0;

  for (const invoice of invoicesWithoutTotals) {
    try {
      // Calculate lost bottles total
      const lostTotal = invoice.lostBottlesTotalAmount || 0;
      
      // Map existing fields to totals group structure
      const totals = {
        subtotal: invoice.netTotal || 0,
        discount: 0, // No discount logic currently implemented
        net: invoice.netTotal || 0,
        tax: 0, // No tax logic currently implemented
        previous: (invoice.previousBalance && invoice.previousBalance > 0) 
          ? invoice.previousBalance 
          : (invoice.previousAdvanceAmount || 0),
        other: lostTotal, // Add lost bottles total to other field
        total: invoice.dueAmount || 0,
        paid: invoice.paidAmount || 0,
        balance: (invoice.remainingAmount && invoice.remainingAmount > 0) 
          ? invoice.remainingAmount 
          : (invoice.advanceAmount || 0),
      };

      // Prepare update data
      const updateData: any = {
        $set: { totals }
      };

      // Add lost bottles group if lost bottles exist
      if (invoice.lostBottlesTotalAmount !== undefined || invoice.lostBottlesCount !== undefined || invoice.lostBottleAmount !== undefined) {
        updateData.$set.lost = {
          count: invoice.lostBottlesCount || 0,
          amount: invoice.lostBottleAmount || 0,
          total: lostTotal
        };
        
        lostBottlesMigratedCount++;
        console.log(`📦 Added lost bottles group for invoice ${invoice._id} - Count: ${invoice.lostBottlesCount || 0}, Amount: ${invoice.lostBottleAmount || 0}, Total: ${lostTotal}`);
      }

      // Update the invoice with the totals group and lost bottles
      await db.updateOne(
        { _id: invoice._id },
        updateData
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
  console.log(`   - Lost bottles groups added: ${lostBottlesMigratedCount} invoices`);
  console.log(`   - Errors: ${errorCount} invoices`);
  console.log(`   - Total invoices: ${invoicesWithoutTotals.length}`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  console.log('🔄 Reverting migration: Remove totals group from invoices and migrate lost bottles back to root fields');

  // Find all invoices that have totals group
  const invoicesWithTotals = await db.find({
    totals: { $exists: true }
  }).toArray();

  console.log(`📊 Found ${invoicesWithTotals.length} invoices with totals group`);

  if (invoicesWithTotals.length === 0) {
    console.log('✅ No invoices need rollback');
    return;
  }

  let processedCount = 0;
  let errorCount = 0;
  let lostBottlesRevertedCount = 0;

  for (const invoice of invoicesWithTotals) {
    try {
      // Prepare update data
      const updateData: any = {
        $unset: { totals: '' }
      };

      // Migrate lost bottles back from lost group to root fields
      if (invoice.lost && (invoice.lost.count !== undefined || invoice.lost.amount !== undefined || invoice.lost.total !== undefined)) {
        const lostTotal = invoice.lost.total || 0;
        
        updateData.$set = {
          lostBottlesCount: invoice.lost.count || 0,
          lostBottleAmount: invoice.lost.amount || 0,
          lostBottlesTotalAmount: lostTotal
        };
        
        lostBottlesRevertedCount++;
        console.log(`📦 Reverted lost bottles for invoice ${invoice._id} - Count: ${invoice.lost.count || 0}, Amount: ${invoice.lost.amount || 0}, Total: ${lostTotal}`);
      }

      // Update the invoice
      await db.updateOne(
        { _id: invoice._id },
        updateData
      );

      processedCount++;
      
      if (processedCount % 100 === 0) {
        console.log(`📈 Processed ${processedCount}/${invoicesWithTotals.length} invoices`);
      }
    } catch (error) {
      console.error(`❌ Error processing invoice ${invoice._id}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Rollback completed:`);
  console.log(`   - Successfully processed: ${processedCount} invoices`);
  console.log(`   - Lost bottles reverted: ${lostBottlesRevertedCount} invoices`);
  console.log(`   - Errors: ${errorCount} invoices`);
  console.log(`   - Total invoices: ${invoicesWithTotals.length}`);
}
