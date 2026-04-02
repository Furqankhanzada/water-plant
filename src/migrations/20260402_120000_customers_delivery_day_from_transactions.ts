import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

const mongoDayToDeliveryDay: Record<number, string> = {
  1: 'sunday',
  2: 'monday',
  3: 'tuesday',
  4: 'wednesday',
  5: 'thursday',
  6: 'friday',
  7: 'saturday',
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const transactionCollection = payload.db.collections.transaction.collection
  const customerCollection = payload.db.collections.customers.collection

  // For each customer, find the weekday with most "bottle given" deliveries.
  const customerPreferredDays = await transactionCollection
    .aggregate([
      {
        $match: {
          customer: { $exists: true, $ne: null },
          transactionAt: { $exists: true, $ne: null },
          bottleGiven: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            customer: '$customer',
            weekday: { $dayOfWeek: '$transactionAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: '$_id.customer',
          preferredWeekday: { $first: '$_id.weekday' },
          deliveriesOnPreferredDay: { $first: '$count' },
        },
      },
    ])
    .toArray()


  if (!customerPreferredDays.length) {
    console.log('No customers with delivery history found for deliveryDay backfill.')
    return
  }

  const operations = []
  for (const row of customerPreferredDays) {
    const deliveryDay = mongoDayToDeliveryDay[row.preferredWeekday]
    if (!deliveryDay) continue

    operations.push({
      updateOne: {
        filter: {
          _id: row._id,
          $or: [{ deliveryDay: { $exists: false } }, { deliveryDay: null }, { deliveryDay: '' }],
        },
        update: {
          $set: { deliveryDay },
        },
      },
    })
  }

  if (!operations.length) {
    console.log('No eligible customer updates to apply for deliveryDay backfill.')
    return
  }

  const result = await customerCollection.bulkWrite(operations)
  console.log(`Updated deliveryDay for ${result.modifiedCount} customers.`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.collections.customers.collection.updateMany(
    {},
    {
      $unset: { deliveryDay: '' },
    },
  )
}
