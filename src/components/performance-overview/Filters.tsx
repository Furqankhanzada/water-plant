'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const Filters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const timeRange = searchParams.get('duration') || 'today'

  const handleDurationChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('duration', value)
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="filters">
      <ToggleGroup
        type="single"
        value={timeRange}
        onValueChange={handleDurationChange}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/main:flex"
      >
        <ToggleGroupItem value="today">Today</ToggleGroupItem>
        <ToggleGroupItem value="this-week">This Week</ToggleGroupItem>
        <ToggleGroupItem value="this-month">This Month</ToggleGroupItem>
        <ToggleGroupItem value="last-month">Last Month</ToggleGroupItem>
        <ToggleGroupItem value="this-quarter">This Quarter</ToggleGroupItem>
        <ToggleGroupItem value="this-year">This Year</ToggleGroupItem>
      </ToggleGroup>
      <Select value={timeRange} onValueChange={handleDurationChange}>
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/main:hidden"
          size="sm"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Today" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="today" className="rounded-lg">
            Today
          </SelectItem>
          <SelectItem value="this-week" className="rounded-lg">
            This Week
          </SelectItem>
          <SelectItem value="this-month" className="rounded-lg">
            This Month
          </SelectItem>
          <SelectItem value="last-month" className="rounded-lg">
            Last Month
          </SelectItem>
          <SelectItem value="this-quarter" className="rounded-lg">
            This Quarter
          </SelectItem>
          <SelectItem value="this-year" className="rounded-lg">
            This Year
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
