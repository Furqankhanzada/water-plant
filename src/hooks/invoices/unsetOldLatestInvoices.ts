import { Invoice } from '@/payload-types';
import { Types } from 'mongoose';
import type { CollectionAfterChangeHook } from 'payload';

const { ObjectId } = Types;

export const unsetOldLatestInvoices: CollectionAfterChangeHook<Invoice> = async ({ doc, req, operation }) => {

  if (operation !== 'create') {
    console.log('⚠️ unsetOldLatestInvoices hook only runs on create operations');
    return;
  }

  const { payload } = req;
  const { customer, id } = doc;

  const db = payload.db.collections.invoice.collection;
  const customerId = typeof customer === 'string' ? new ObjectId(customer) : new ObjectId(customer.id);

  // Set isLatest = false for all other invoices of the customer
  await db.updateMany(
    {
      customer: customerId,
      _id: { $ne: new ObjectId(id) },
    },
    {
      $set: { isLatest: false },
    }
  );
};
