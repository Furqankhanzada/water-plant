'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWhatsAppManager } from '@/hooks/whatsapp/useWhatsAppManager'
import type { WhatsAppStatus } from '@/services/whatsapp/types'

export default function WhatsAppManager() {
  // All state and logic is now in the hook
  const {
    state,
    fetchStatus,
    handleLogin,
    handleLogout,
    handleSendPaymentReminder,
    handleSendInvoice,
  } = useWhatsAppManager()

  // Utility Functions
  const getStatusBadgeVariant = (status: WhatsAppStatus) => {
    switch (status) {
      case 'connected':
        return 'default'
      case 'disconnected':
      case 'error':
      case 'logged_out':
        return 'destructive'
      case 'pairing_code':
      case 'connecting':
      case 'starting':
      case 'restarting':
        return 'secondary'
      case 'idle':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: WhatsAppStatus) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Error'
      case 'logged_out':
        return 'Logged Out'
      case 'pairing_code':
        return 'Pairing Code'
      case 'connecting':
        return 'Connecting'
      case 'starting':
        return 'Starting'
      case 'restarting':
        return 'Restarting'
      case 'idle':
        return 'Idle'
      default:
        return 'Unknown'
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WhatsApp Manager</span>
            {state.loginTimerActive && state.loginTimer !== null && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Time remaining: {formatTimer(state.loginTimer)}
                </span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Manage WhatsApp connection and send messages to customers
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Status Section */}
          <div className="flex items-center justify-between p-6 bg-muted/30 rounded-lg border mb-0">
            <div className="flex items-center gap-4">
              <span className="text-base font-medium text-foreground">Connection Status:</span>
              <Badge variant={getStatusBadgeVariant(state.status)} className="font-medium text-base py-0">
                {getStatusLabel(state.status)}
              </Badge>
            </div>
            <button
              onClick={() => fetchStatus(true)}
              disabled={state.statusLoading}
              className={cn(
                "p-2 transition-colors bg-transparent border-none shadow-none rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Refresh status"
            >
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  state.statusLoading && "animate-spin"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">
            <Button
              onClick={handleSendPaymentReminder}
              disabled={state.loading || state.status !== 'connected'}
              buttonStyle="subtle"
              size="medium"
              className="w-full"
            >
              Send Payment Reminders
            </Button>

            <Button
              onClick={handleSendInvoice}
              disabled={state.loading || state.status !== 'connected'}
              buttonStyle="subtle"
              size="medium"
              className="w-full"
            >
              Send Invoices
            </Button>
          </div>

          {/* QR Code Section */}
          {state.qrCode && (
            <div className="p-8 bg-muted/20 rounded-lg text-center border">
              <h4 className="text-base font-medium mb-6 text-foreground">Scan QR Code to Connect</h4>

              <div className="inline-block p-6 bg-background rounded-lg border-2 border-muted">
                <img
                  src={state.qrCode.qrCode}
                  alt="WhatsApp QR Code"
                  className={cn(
                    "w-80 h-80 object-contain transition-all duration-1000",
                    state.qrAnimation && "scale-110 drop-shadow-lg"
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                QR generated {state.qrCode.elapsed}s ago. Scan before it expires.
              </p>
            </div>
          )}

          {/* Connection Actions */}
          <div className="border-t border-border">
            {state.status === 'connected' ? (
              <Button
                onClick={handleLogout}
                disabled={state.loading}
                buttonStyle="primary"
                size="large"
                className="w-full mb-0"
              >
                {state.loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={state.loading}
                buttonStyle="subtle"
                size="large"
                className="w-full mb-0"
              >
                {state.loading ? 'Processing...' : 'Connect WhatsApp / Get QR'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
