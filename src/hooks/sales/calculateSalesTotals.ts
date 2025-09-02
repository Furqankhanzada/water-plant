import { Sale } from '@/payload-types'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * 🔄 Hook: calculateSalesTotals (Before Change)
 *
 * This hook runs before creating or updating a Sale. It calculates the totals
 * from the item fields and populates the totals group fields:
 *
 * 1. 📦 Calculates subtotal from item quantity × unitPrice
 * 2. 💰 Applies discount if enabled (percentage or fixed amount)
 * 3. 🧮 Calculates net amount (subtotal - discount)
 * 4. 📊 Calculates tax amount (net × taxRate)
 * 5. 💵 Calculates gross amount (net + tax)
 *
 * The totals are automatically calculated and stored in the totals group field
 * which is read-only in the admin interface.
 */

export const calculateSalesTotals: CollectionBeforeChangeHook<Sale> = async ({
  data,
}) => {
  // Initialize totals
  let subtotal = 0
  let totalDiscount = 0
  let totalTax = 0

  // Calculate totals from item fields
  if (data.item) {
    const { quantity, unitPrice, taxRate, discount } = data.item

    // Calculate subtotal with null checks
    const qty = quantity ?? 1
    const price = unitPrice ?? 0
    subtotal = qty * price

    // Calculate discount if enabled
    if (discount?.enabled && discount?.value) {
      if (discount.type === 'percentage') {
        totalDiscount = (subtotal * discount.value) / 100
      } else {
        // Fixed amount discount
        totalDiscount = discount.value
      }
    }

    // Calculate net amount (subtotal - discount)
    const net = subtotal - totalDiscount

    // Calculate tax amount (net × taxRate) with null check
    const rate = taxRate ?? 0
    totalTax = (net * rate) / 100
  }

  // Calculate gross amount (net + tax)
  const gross = (subtotal - totalDiscount) + totalTax

  // Update the totals group
  data.totals = {
    subtotal,
    discount: totalDiscount,
    net: subtotal - totalDiscount,
    tax: totalTax,
    gross,
  }

  return data
}
