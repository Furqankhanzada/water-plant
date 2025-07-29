import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  // 1. Find _id of latest invoice per customer
  const pipeline = [
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$customer',
        latestId: { $first: '$_id' },
      },
    },
  ];

  const latestPerCustomer = await db.aggregate(pipeline).toArray();
  const latestIds = latestPerCustomer.map((entry) => entry.latestId);

  console.log(`✅ Found ${latestIds.length} latest invoices`);

  // 2. Set isLatest: false for all invoices
  const unsetResult = await db.updateMany({}, { $set: { isLatest: false } });
  console.log(`🧹 Marked isLatest false on ${unsetResult.modifiedCount} invoices`);

  // 3. Set isLatest: true for latest per customer
  const setResult = await db.updateMany(
    { _id: { $in: latestIds } },
    { $set: { isLatest: true } }
  );
  console.log(`✅ Set isLatest true on ${setResult.modifiedCount} invoices`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const db = payload.db.collections.invoice.collection;

  console.log('🔄 Reverting migration: unset all isLatest flags');

  const result = await db.updateMany({}, { $unset: { isLatest: '' } });

  console.log(`🧹 Unset isLatest on ${result.modifiedCount} invoices`);
}
