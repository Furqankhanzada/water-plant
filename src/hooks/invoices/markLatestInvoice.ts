import { Invoice } from '@/payload-types';
import { Types } from 'mongoose';
import type { CollectionAfterChangeHook } from 'payload';

export const markLatestInvoice: CollectionAfterChangeHook<Invoice> = async ({ doc, req }) => {
  const { payload } = req;
  const { customer } = doc;

  const db = payload.db.collections.invoice.collection;
  const customerId = typeof customer === 'string' ?
    new Types.ObjectId(customer) : new Types.ObjectId(customer.id);

  // Find the latest invoice for this customer based on createdAt
  const latest = await db.findOne(
    { customer: customerId },
    { sort: { createdAt: -1 } }
  );

  const latestInvoiceId = latest?._id;

  if (!latestInvoiceId) {
    console.log('⚠️ No invoice found for customer:', customer);
    return;
  }

  // Set isLatest = true for the latest
  const latestUpdate = await db.updateOne(
    { _id: latestInvoiceId },
    { $set: { isLatest: true } }
  );

  console.log('✅ Set isLatest: true on invoice:', latestInvoiceId.toString(), '=>', latestUpdate.modifiedCount, 'document(s) updated');

  // Set isLatest = false for all other invoices of the customer
  const othersUpdate = await db.updateMany(
    {
      customer,
      _id: { $ne: latestInvoiceId },
    },
    {
      $set: { isLatest: false },
    }
  );

  console.log('🔄 Set isLatest: false on other invoices =>', othersUpdate.modifiedCount, 'document(s) updated');
};
