type Payload = {}
export const sendMessage = (payload: Payload) => {
  return fetch(
    `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        ...payload,
      }),
    },
  )
}

export async function uploadMedia(pdfUrl: string) {
  const file = await fetch(pdfUrl)
  const blob = await file.blob()
  const pdfBlob = new Blob([blob], { type: 'application/pdf' })
  const formData = new FormData()
  formData.append('messaging_product', 'whatsapp')
  formData.append('type', 'document')
  formData.append('file', pdfBlob)

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: formData,
    },
  )

  const data = await response.json()
  return data.id // Returns media ID
}
