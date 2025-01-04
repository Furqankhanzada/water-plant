import type { CollectionAfterChangeHook } from 'payload';
import { Invoice } from '@/payload-types'; // Ensure you have the correct path to the Invoice type

export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  const invoiceResult = doc as Invoice;

  if (operation === 'create' || operation === 'update') {
    await payload.update({
      collection: 'transaction',
      where: {
        id: {
          in: invoiceResult.transaction,
        },
      },
      data: {
        status: 'pending',
      },
    });
  }

  return doc;
};