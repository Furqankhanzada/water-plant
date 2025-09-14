import React from 'react'
import { OverviewCard } from './OverviewCard'
import { rupee } from '@/collections/Reports'

interface PaymentMethodBreakdownProps {
  cash: number
  online: number
  total: number
  title?: string
  description?: string
  secondaryDescription?: string
}

export const PaymentMethodBreakdown: React.FC<PaymentMethodBreakdownProps> = ({
  cash,
  online,
  total,
  secondaryDescription
}) => {
  const cashPercentage = total > 0 ? ((cash / total) * 100).toFixed(1) : '0.0'
  const onlinePercentage = total > 0 ? ((online / total) * 100).toFixed(1) : '0.0'

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <OverviewCard
        title="Cash Payments"
        value={rupee.format(cash)}
        description={`${cashPercentage}% of total revenue`}
        secondaryDescription={secondaryDescription}
      />
      <OverviewCard
        title="Online Payments"
        value={rupee.format(online)}
        description={`${onlinePercentage}% of total revenue`}
        secondaryDescription={secondaryDescription}
      />
    </div>
  )
}
