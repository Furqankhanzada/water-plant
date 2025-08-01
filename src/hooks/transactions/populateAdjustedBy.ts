import type { CollectionBeforeChangeHook } from 'payload'

export const populateAdjustedBy: CollectionBeforeChangeHook = async ({
  data,
  req: { user },
}) => {
  // Auto-populate adjustedBy with current logged-in user when manualOverride is true
  if (data.manualOverride === true && user?.id) {
    data.adjustedBy = user.id
  }

  // Clear adjustedBy if manualOverride is false
  if (data.manualOverride === false) {
    data.adjustedBy = null
  }

  return data
}
