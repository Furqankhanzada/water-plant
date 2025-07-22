import { DefaultServerCellComponentProps } from 'payload'
import moment from 'moment';

export function getTimeAgo(dateString: Date | string): string {
  const now = moment();
  const date = moment(dateString);
  const diffInMinutes = now.diff(date, 'minutes');
  const diffInHours = now.diff(date, 'hours');
  const diffInDays = now.diff(date, 'days');

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}

const DeliveryDayCell = async ({ rowData, payload }: DefaultServerCellComponentProps) => {
  console.log('DeliveryDayCell', rowData);
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

  console.log('daysAgo', transactionAt);
  return (
    <div>
      {transactionAt ? getTimeAgo(transactionAt) : 'No delivery yet'}
    </div>
  )
};

export default DeliveryDayCell;
