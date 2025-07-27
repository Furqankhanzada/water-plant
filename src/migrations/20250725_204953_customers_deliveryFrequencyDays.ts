import {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Migration code
  await payload.db.collections.customers.collection.updateMany(
    {
      deliveryFrequencyDays: { $exists: false },
    },
    {
      $set: {
        deliveryFrequencyDays: 4,
      },
    },
  )
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Migration code
  await payload.db.collections.customers.collection.updateMany(
    {
      deliveryFrequencyDays: { $exists: true },
    },
    {
      $unset: {
        deliveryFrequencyDays: '',
      },
    },
  )
}
