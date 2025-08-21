import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import { format } from 'date-fns'
import inlineCSS from 'inline-css'
import { getHandlebarsTemplate } from '@/lib/getHandlebarsTemplate'
import { customerDeliveryGenerator } from '@/services/CustomerDeliveryGenerator'

/**
 * transactionBeforeChange
 * ------------------------
 * This hook runs before creating or updating a transaction.
 * Responsibilities:
 *  1. Ensure no duplicate transaction for the same customer in the same trip (on create only)
 *  2. Calculate the remaining bottles for the customer
 *  3. Calculate the transaction total
 *  4. Attach updated analytics for the customer
 *  5. Send a notification email if bottle counts have changed
 */
export const transactionBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const { payload, headers } = req

  // ----------------------------
  // Extract customer ID
  // ----------------------------
  const customerId = typeof data.customer === 'string' ? data.customer : data.customer?.id

  // If no customer is linked, skip all processing
  if (!customerId) return data

  // ----------------------------
  // Fetch customer record (once only)
  // ----------------------------
  const customer = await payload.findByID({
    collection: 'customers',
    id: customerId,
    select: {
      bottlesAtHome: true,
      rate: true,
      email: true,
      name: true,
    },
  })

  // ----------------------------
  // ✅ 1. Prevent duplicate trip transactions (on create only)
  // ----------------------------
  if (operation === 'create' && data.trip) {
    const existing = await payload.find({
      collection: 'transaction',
      where: {
        and: [{ customer: { equals: customerId } }, { trip: { equals: data.trip } }],
      },
      limit: 1,
    })

    if (existing.totalDocs) {
      throw new APIError(
        `A transaction for this customer already exists in this trip.`,
        400,
        null,
        true,
      )
    }
  }

  // ----------------------------
  // ✅ 2. Calculate remaining bottles
  // ----------------------------
  // Find the most recent transaction before this one
  const previousTransaction = await payload.find({
    collection: 'transaction',
    limit: 1,
    sort: '-transactionAt',
    where: {
      customer: { equals: customerId },
      transactionAt: { less_than: data.transactionAt },
    },
    select: { transactionAt: true, remainingBottles: true },
  })

  if (!previousTransaction.docs.length) {
    // No previous transaction → start from bottlesAtHome
    data.remainingBottles = customer.bottlesAtHome + data.bottleGiven - data.bottleTaken
  } else {
    // Build on previous remainingBottles value
    data.remainingBottles =
      previousTransaction.docs[0].remainingBottles + data.bottleGiven - data.bottleTaken
  }

  // ----------------------------
  // ✅ 3. Calculate total price for this transaction
  // ----------------------------
  data.total = data.bottleGiven * customer.rate

  // ----------------------------
  // ✅ 4. Attach customer analytics
  // ----------------------------

  const hasValidAnalytics = data.analytics && Object.values(data.analytics).some(Boolean)

  if (!hasValidAnalytics) {
    data.analytics = await customerDeliveryGenerator.fetchAnalyticsByCustomerId(customerId, payload)
  }

  // ----------------------------
  // ✅ 5. Send update email (only if bottle counts changed)
  // ----------------------------
  const bottlesChanged = data.bottleGiven > 0 || data.bottleTaken > 0

  const valuesDifferent =
    originalDoc?.bottleGiven !== data.bottleGiven || originalDoc?.bottleTaken !== data.bottleTaken

  if (bottlesChanged && valuesDifferent && customer.email) {
    // Construct full site URL for images/links
    const host = headers.get('x-forwarded-host') || headers.get('url')
    const protocol = headers.get('x-forwarded-proto') || 'https'
    const fullUrl = `${protocol}://${host}`

    // Generate HTML from Handlebars template
    const html = await inlineCSS(
      getHandlebarsTemplate('transaction')({
        bottleGiven: data.bottleGiven,
        bottleTaken: data.bottleTaken,
        date: format(data.transactionAt, 'EEE, MMM dd yyyy'),
        customer: customer.name,
        image: fullUrl + '/api/media/file/ad.jpg',
      }),
      { url: ' ', removeStyleTags: false },
    )

    // Send the email
    await payload.sendEmail({
      to: customer.email,
      subject: `Water Bottles Delivery - ${format(data.transactionAt, 'EEE, MMM dd yyyy')}`,
      html,
    })
  }

  return data
}
