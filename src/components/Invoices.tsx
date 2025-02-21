import Link from 'next/link'
import { ServerComponentProps } from 'payload'

import { isWhatsAppEnabled } from '@/lib/sendWhatsAppMessage'

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
      href={`/invoices/${props.id ? props.id : props.rowData.id}/pdf`}
      className={`btn btn--size-${props.id ? 'medium' : 'small'} btn--style-primary`}
    >
      Generate Invoice
    </Link>
  )
}

export const SendInvoiceButton = async (
  props: ServerComponentProps & { rowData: { id: string } },
) => {
  if (!isWhatsAppEnabled()) return null
  if (!props.id && !props.rowData) {
    return null
  }
  const invoiceId = props.id ? props.id : props.rowData.id
  return (
    <Link
      target="_blank"
      style={{
        display: 'inline-block',
        marginBlock: `${props.id ? 'revert-layer' : 'auto'}`,
        ...(props.id && { marginLeft: '10px' }),
      }}
      href={`/invoices/${invoiceId}/send`}
      className={`btn btn--size-${props.id ? 'medium' : 'small'} btn--style-pill`}
    >
      Send Invoice
    </Link>
  )
}
