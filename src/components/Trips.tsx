import Link from 'next/link'
import { ServerComponentProps } from 'payload'
import mongoose from 'mongoose'

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export const GeneratePdfButton = async (
  props: ServerComponentProps & { rowData: { id: string } },
) => {
  if (!props.id && !props.rowData) {
    return null
  }
  return (
    <Link
      target="_blank"
      style={{
        display: 'inline-block',
        marginBlock: `${props.id ? 'revert-layer' : 'auto'}`,
      }}
      href={`/trips/${props.id ? props.id : props.rowData.id}/pdf`}
      className={`btn btn--size-${props.id ? 'medium' : 'small'} btn--style-primary`}
    >
      Generate Trip Report
    </Link>
  )
}

export const Info = async (props: ServerComponentProps & { rowData: { id: string } }) => {
  const transactions = await props.req.payload.db.collections['transaction'].aggregate([
    {
      $match: {
        trip: { $eq: new mongoose.Types.ObjectId(props.id || props.rowData.id) },
      },
    },
    {
      $group: {
        _id: '$trip',
        totalBottlesCounts: { $sum: '$bottleGiven' },
        totalAmount: { $sum: '$total' },
        totalCustomers: { $sum: 1 },
      },
    },
  ])

  return (
    <div
      style={{
        display: 'inline-block',
        fontSize: '20px',
        marginLeft: '30px',
      }}
    >
      {transactions.map((transaction) => {
        return (
          <div key={transaction._id}>
            <i>Trip Summary:</i> <b>{transaction.totalBottlesCounts}</b> bottles distributed to{' '}
            <b>{transaction.totalCustomers}</b> customers, totaling{' '}
            <b>{rupee.format(transaction.totalAmount)}</b>.
          </div>
        )
      })}
    </div>
  )
}
