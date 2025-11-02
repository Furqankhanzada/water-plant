import { Invoice } from '@/payload-types'
import { differenceInCalendarDays, format, isFuture, isPast, isToday, parseISO } from 'date-fns'

/**
 * Centralized message templates for WhatsApp Business Bot
 */

// Currency formatter for Pakistani Rupee
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Date formatter
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-PK', options || defaultOptions)
}

/**
 * Convert date string or Date object to Date
 */
const toDate = (dateInput: string | Date): Date => {
  return typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
}

/**
 * Generate invoice filename
 * Handles Date objects, ISO strings, and display format strings
 */
export const generateInvoiceFilename = (dueAt: string | Date): string => {
  const date = toDate(dueAt)
  return `${format(date, 'MMMM')}-Invoice.pdf`
}

/**
 * Delivery confirmation message
 */
export const deliveryConfirmation = (template: any): string => {
  return `
      🏠 *Delivery Confirmation*

      Dear *${template.customerName}*,

      ✅ *Delivery Details:*
      • Bottles Delivered: *${template.bottlesDelivered}*
      • Empty Bottles Collected: *${template.emptyBottlesCollected}*
      • Total Amount: *${formatCurrency(template.totalAmount)}*
      • Delivery Date: *${template.deliveryDate}*

      Thank you for choosing our water delivery service! 💧`
}

/**
 * Daily delivery summary for admin
 */
export const dailySummary = (summary: any): string => {
  return `
      📊 *Daily Delivery Summary - ${summary.date}*
  
      📈 *Statistics:*
      • Total Deliveries: *${summary.totalDeliveries}*
      • Bottles Delivered: *${summary.totalBottles}*
      • Empty Bottles Collected: *${summary.totalEmpty}*
      • Total Revenue: *${formatCurrency(summary.totalRevenue)}*
  
      ✅ *Completed Deliveries:*
      ${summary.deliveries
        .map(
          (d: any) =>
            `• ${d.customer.name} - ${d.bottlesDelivered} bottles - ${formatCurrency(d.totalAmount)}`,
        )
        .join('\n')}`
}

/**
 * Invoice caption for PDF
 */
export const invoiceCaption = (invoice: Invoice): string => {
  const dueDate = formatDate(toDate(invoice.dueAt as string | Date))

  if (typeof invoice.customer !== 'object') {
    throw new Error('Customer is required and must have name')
  }

  switch (invoice.status) {
    case 'unpaid':
      return `Dear *${invoice.customer.name}*,\n\nYour invoice is attached and total dues are *${formatCurrency(invoice.totals?.total ?? 0)}*/-.\n\nDue Date: *${dueDate}*`
    case 'partially-paid':
      return `Dear *${invoice.customer.name}*,\n\nYour invoice is attached and remaining dues are *${formatCurrency(invoice.totals?.balance ?? 0)}*/-.\n\nDue Date: *${dueDate}*`
    case 'paid':
      return `Dear *${invoice.customer.name}*,\n\nYour invoice is attached and all dues are paid.\n\nDue Date: *${dueDate}*`
    default:
      return `Dear *${invoice.customer.name}*,\n\nPlease find your invoice attached.\n\nDue Date: *${dueDate}*`
  }
}

/**
 * Payment reminder message
 */
export const paymentReminder = (invoice: Invoice): string => {
  const dueAt = parseISO(invoice.dueAt)
  const today = new Date()

  const daysDiff = differenceInCalendarDays(dueAt, today)
  let urgencyLevel = ''

  if (isToday(dueAt)) {
    urgencyLevel = `🔴 *DUE TODAY*`
  } else if (isPast(dueAt)) {
    urgencyLevel = `⚠️ *OVERDUE BY ${Math.abs(daysDiff)} DAYS*`
  } else if (isFuture(dueAt)) {
    urgencyLevel = `🟡 *DUE IN ${daysDiff} DAYS*`
  }

  if (typeof invoice.customer !== 'object') {
    throw new Error('Customer is required and must have name')
  }

  return `
      💰 *Payment Reminder*

      Dear *${invoice.customer.name}*,

      ${urgencyLevel}

      Your invoice ${format(parseISO(invoice.dueAt), 'MMMM')} has a remaining balance of *${formatCurrency(invoice.totals?.total ?? 0)}*.

      📅 *Due Date:* ${dueAt}

      Please make the payment at your earliest convenience to avoid any service interruption.

      Thank you for your prompt attention! 💧

      ---
      *Water Delivery Service*`
}
