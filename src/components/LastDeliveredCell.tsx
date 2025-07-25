import { DefaultServerCellComponentProps } from 'payload'
import { formatDistanceWithFallback } from '@/lib/utils'

const LastDeliveredCell = async ({ rowData, payload, collectionSlug }: DefaultServerCellComponentProps) => {
  const customerId = collectionSlug === 'customers' ? rowData.id : rowData.customer;
  const transactionAt = (await payload.find({
    collection: 'transaction',
    where: {
      customer: {
        equals: customerId,
      },
      bottleGiven: {
        greater_than: 0,
      }
    },
    limit: 1,
    sort: '-transactionAt',
    select: {
      transactionAt: true,
    }
  })).docs[0]?.transactionAt;

  return (
    <div>
      {formatDistanceWithFallback(transactionAt, { fallback: 'Never Delivered' })}
    </div>
  )
};

export default LastDeliveredCell;
