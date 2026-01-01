'use client'

import { useEffect, useRef, useReducer, useState } from 'react'
import { toast } from '@payloadcms/ui'
import type { WhatsAppStatus } from '@/services/whatsapp/types'
import {
  fetchWhatsAppStatus,
  whatsAppLogin,
  logoutWhatsAppClient,
} from '@/services/whatsapp'
import { fetchWhatsAppGlobalDocument } from '@/serverActions'

// Types
interface QRCodeData {
  qrCode: string
  timestamp: string
  elapsed: number
}

interface WhatsAppState {
  status: WhatsAppStatus
  qrCode: QRCodeData | null
  loading: boolean
  statusLoading: boolean
  qrAnimation: boolean
  loginTimer: number | null
  loginTimerActive: boolean
}

type WhatsAppAction =
  | { type: 'SET_STATUS'; payload: WhatsAppStatus }
  | { type: 'SET_QR_CODE'; payload: QRCodeData | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATUS_LOADING'; payload: boolean }
  | { type: 'SET_QR_ANIMATION'; payload: boolean }
  | { type: 'SET_LOGIN_TIMER'; payload: number | null }
  | { type: 'SET_LOGIN_TIMER_ACTIVE'; payload: boolean }
  | { type: 'UPDATE_QR_ELAPSED' }
  | { type: 'DECREMENT_LOGIN_TIMER' }
  | { type: 'RESET_LOGIN_TIMER' }
  | { type: 'CLEAR_QR_AND_TIMER' }

// WebSocket message types
type WebSocketStatusMessage =
  | { type: 'idle'; }
  | { type: 'starting'; }
  | { type: 'pairing_code'; code: string; timestamp: string }
  | { type: 'connecting'; }
  | { type: 'connected'; user?: any }
  | { type: 'disconnected'; }
  | { type: 'restarting'; }
  | { type: 'logged_out'; }
  | { type: 'error'; reason?: string; message?: string }

// Initial state
const initialState: WhatsAppState = {
  status: 'idle',
  qrCode: null,
  loading: false,
  statusLoading: false,
  qrAnimation: false,
  loginTimer: null,
  loginTimerActive: false,
}

// Reducer
function whatsAppReducer(state: WhatsAppState, action: WhatsAppAction): WhatsAppState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    
    case 'SET_QR_CODE':
      return { ...state, qrCode: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_STATUS_LOADING':
      return { ...state, statusLoading: action.payload }
    
    case 'SET_QR_ANIMATION':
      return { ...state, qrAnimation: action.payload }
    
    case 'SET_LOGIN_TIMER':
      return { ...state, loginTimer: action.payload }
    
    case 'SET_LOGIN_TIMER_ACTIVE':
      return { ...state, loginTimerActive: action.payload }
    
    case 'UPDATE_QR_ELAPSED':
      if (!state.qrCode) return state
      return {
        ...state,
        qrCode: {
          ...state.qrCode,
          elapsed: Math.floor((Date.now() - new Date(state.qrCode.timestamp).getTime()) / 1000)
        }
      }
    
    case 'DECREMENT_LOGIN_TIMER':
      if (state.loginTimer === null || state.loginTimer <= 0) {
        return { ...state, loginTimerActive: false, loginTimer: null }
      }
      return { ...state, loginTimer: state.loginTimer - 1 }
    
    case 'RESET_LOGIN_TIMER':
      return { ...state, loginTimer: null, loginTimerActive: false }
    
    case 'CLEAR_QR_AND_TIMER':
      return { ...state, qrCode: null, loginTimer: null, loginTimerActive: false }
    
    default:
      return state
  }
}

export const useWhatsAppManager = () => {
  const [state, dispatch] = useReducer(whatsAppReducer, initialState)
  const [clientId, setClientId] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Fetch client ID from WhatsApp global document
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const doc = await fetchWhatsAppGlobalDocument()
        console.log('WhatsApp global data:', doc)
        
        // Use doc.id as the client ID
        setClientId(doc?.id || null)
      } catch (error) {
        console.error('Failed to fetch WhatsApp global document:', error)
        // Set null if not found
        setClientId(null)
      }
    }

    fetchClientId()
  }, [])

  // WebSocket connection
  useEffect(() => {
    if (!clientId) return // Wait for clientId to be fetched
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WHATSAPP_API_URL}/?clientId=${clientId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('🔌 WebSocket connected')
      toast.success('Real-time connection established')
    }

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected')
      toast.error('Real-time connection lost')
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      toast.error('WebSocket connection error')
    }

    ws.onmessage = (event) => {
      try {
        const data: WebSocketStatusMessage = JSON.parse(event.data)
        const status = data.type
        
        if (status === 'pairing_code') {
          console.log('📱 QR Code received via WebSocket, starting timer...')
          
          // Trigger QR animation
          dispatch({ type: 'SET_QR_ANIMATION', payload: true })
          setTimeout(() => dispatch({ type: 'SET_QR_ANIMATION', payload: false }), 1000)
          
          dispatch({
            type: 'SET_QR_CODE',
            payload: {
              qrCode: data.code,
              timestamp: data.timestamp,
              elapsed: 0
            }
          })
          
          // Start 1-minute login timer when QR code is received
          dispatch({ type: 'SET_LOGIN_TIMER', payload: 60 })
          dispatch({ type: 'SET_LOGIN_TIMER_ACTIVE', payload: true })
          
          toast.success('QR Code received via WebSocket')
        } else if (status === 'connected') {
          // Clear QR code and stop timer when connected
          dispatch({ type: 'CLEAR_QR_AND_TIMER' })
        } else if (status) {
          dispatch({ type: 'SET_STATUS', payload: status })         
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    return () => {
      ws.close()
    }
  }, [clientId])

  // QR Code timer - updates elapsed time every second
  useEffect(() => {
    if (!state.qrCode) return
    
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_QR_ELAPSED' })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state.qrCode])

  // Login timer - 2 minutes countdown
  useEffect(() => {
    if (!state.loginTimerActive) return
    
    console.log('⏰ Login timer started:', state.loginTimer, 'seconds')
    
    const interval = setInterval(() => {
      dispatch({ type: 'DECREMENT_LOGIN_TIMER' })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state.loginTimerActive, state.loginTimer])

  // API Functions
  const fetchStatus = async (showLoading = false) => {
    if (!clientId) {
      console.log('No clientId available yet, skipping fetchStatus')
      return
    }
    
    if (showLoading) dispatch({ type: 'SET_STATUS_LOADING', payload: true })
    
    try {      
      const data = await fetchWhatsAppStatus(clientId)
      console.log('WhatsApp status:', data)
      const newStatus = data?.status || 'idle'
      
      dispatch({ type: 'SET_STATUS', payload: newStatus })
      
      // Clear QR code when connected
      if (newStatus === 'connected') {
        dispatch({ type: 'CLEAR_QR_AND_TIMER' })
      }
      
      if (showLoading) {
        toast.success('Status refreshed successfully')
      }
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' })
      if (showLoading) {
        toast.error('Failed to refresh status')
      }
    } finally {
      if (showLoading) dispatch({ type: 'SET_STATUS_LOADING', payload: false })
    }
  }

  const handleLogin = async () => {
    if (!clientId) {
      toast.error('Client ID not available yet')
      return
    }
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      await whatsAppLogin(clientId)
    } catch (error: any) {
      toast.error('Login failed: ' + error.message)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleLogout = async () => {
    if (!clientId) {
      toast.error('Client ID not available yet')
      return
    }
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const data = await logoutWhatsAppClient(clientId)
      
      if (data.success) {
        toast.success('Client logout successfully')
        dispatch({ type: 'CLEAR_QR_AND_TIMER' })
        dispatch({ type: 'SET_STATUS', payload: 'disconnected' })
      } else {
        toast.error(data.message || 'Reset failed')
      }
    } catch (error: any) {
      toast.error('Reset failed: ' + error.message)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleSendPaymentReminder = () => {
    // TODO: Implement payment reminder functionality
    toast.info('Payment reminder feature coming soon')
  }

  const handleSendInvoice = () => {
    // TODO: Implement invoice sending functionality
    toast.info('Invoice sending feature coming soon')
  }

  // Fetch status once when clientId is available
  useEffect(() => {
    if (clientId) {
      fetchStatus()
    }
  }, [clientId])

  return {
    // State
    state,
    
    // Actions
    fetchStatus,
    handleLogin,
    handleLogout,
    handleSendPaymentReminder,
    handleSendInvoice,
  }
}
