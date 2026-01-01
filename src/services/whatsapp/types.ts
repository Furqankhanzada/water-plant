
export type WAStatus =
  | 'idle'
  | 'starting'
  | 'pairing_code'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'restarting'
  | 'logged_out'
  | 'error'

export type WhatsAppStatus = WAStatus

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface StatusResponse {
  clientId: string
  status: WhatsAppStatus
}

export interface QrResponse {
  clientId: string
  qrCode: string | null
  status: WhatsAppStatus
}

export interface MessageFile {
  data: Blob;
  type: string;
  name: string;
}

interface BaseMessage {
  clientId: string
  phone: string
}

export interface TextMessage extends BaseMessage {
  text: string
  file?: never
}

export interface FileMessage extends BaseMessage {
  file: MessageFile
  text?: never
}

export interface TextAndFileMessage extends BaseMessage {
  text: string
  file: MessageFile
}

export type Message = TextMessage | FileMessage | TextAndFileMessage
