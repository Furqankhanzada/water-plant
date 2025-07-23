import { DefaultServerCellComponentProps } from 'payload'
import { getTimeAgo } from '@/lib/utils'

const DeliveryDayCell = async ({ rowData, payload }: DefaultServerCellComponentProps) => {
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
      {transactionAt ? getTimeAgo(transactionAt) : 'No delivery yet'}
    </div>
  )
};

export default DeliveryDayCell;
