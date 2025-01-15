import Link from 'next/link'
import { ServerComponentProps } from 'payload'

export const GeneratePdfButton = async (props: ServerComponentProps) => {
  // console.log('data', props.data)
  // console.log('id', props.id)
  // console.log('props', props)
  return (
    <Link
      target="_blank"
      href={`/invoices/${props.id}/pdf`}
      className="btn btn--icon-style-without-border btn--size-medium btn--style-primary"
    >
      Generate PDF Invoice
    </Link>
  )
}
