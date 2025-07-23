import { DefaultServerCellComponentProps } from 'payload'
import { getTimeAgo } from '@/lib/utils'

const LastDeliveredCell = async ({ rowData, payload }: DefaultServerCellComponentProps) => {
  const transactionAt = (await payload.find({
    collection: 'transaction',
    where: {
      customer: {
        equals: rowData.customer,
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
