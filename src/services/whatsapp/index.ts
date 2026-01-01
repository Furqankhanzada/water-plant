import { Invoice } from '@/payload-types'
import { generateInvoiceFilename, invoiceCaption } from './templates'
import { ApiResponse, QrResponse, Message, StatusResponse } from './types'

const WHATSAPP_BACKEND_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL!

export async function fetchWhatsAppStatus(clientId: string): Promise<StatusResponse> {
  const res = await fetch(`${WHATSAPP_BACKEND_URL}/clients/${clientId}/status`)
  if (!res.ok) throw new Error('Failed to fetch status')
  return res.json()
}

export async function whatsAppLogin(clientId: string): Promise<ApiResponse<QrResponse>> {
  const res = await fetch(`${WHATSAPP_BACKEND_URL}/clients/${clientId}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
  if (!res.ok) throw new Error('Failed to login')
  return res.json()
}

export async function logoutWhatsAppClient(clientId: string): Promise<ApiResponse<StatusResponse>> {
  const res = await fetch(`${WHATSAPP_BACKEND_URL}/clients/${clientId}/logout`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to logout client')
  return res.json()
}

export async function sendWhatsAppMessage(message: Message): Promise<ApiResponse<null>> {
  const form = new FormData()

  form.append('clientId', message.clientId)
  form.append('to', message.to)

  if (message.text) {
    form.append('text', message.text)
  }

  if (message.file) {
    form.append(
      'file',
      new Blob([message.file.data], { type: message.file.type }),
      message.file.name,
    )
  }

  const res = await fetch(`${WHATSAPP_BACKEND_URL}/clients/${message.clientId}/send-message`, {
    method: 'POST',
    body: form,
  })

  if(!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to send message')
  }
  return res.json()
}

/**
 * Send an invoice PDF to a customer via WhatsApp
 * @param invoice Invoice payload
 * @param phone Phone number
 */
export async function sendInvoice(invoice: Invoice, phone: string, clientId: string) {

  if(!invoice) {
    throw new Error('Invoice is required')
  }

  if(!phone) {
    throw new Error('Phone number is required')
  }

  if(!clientId) {
    throw new Error('Client ID is required')
  }

  console.log('### process.env.URL ###', `${process.env.URL}/invoices/${invoice.id}/pdf`)

  const pdf = await fetch(`${process.env.URL}/invoices/${invoice.id}/pdf`)

  if(!pdf.ok) {
    throw new Error('Failed to fetch PDF')
  }

  const blob = await pdf.blob()

  const file = {
    data: blob,
    name: generateInvoiceFilename(invoice.dueAt),
    type: 'application/pdf',
  }

  const message: Message = {
    clientId: clientId,
    to: phone,
    text: invoiceCaption(invoice),
    file: file,
  }
  return sendWhatsAppMessage(message)
}
