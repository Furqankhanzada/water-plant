import { DefaultServerCellComponentProps } from 'payload'
import { getTimeAgo } from '@/lib/utils'

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
      {getTimeAgo(transactionAt)}
    </div>
  )
};

export default LastDeliveredCell;
