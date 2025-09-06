'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export const Filters = () => {
    const [timeRange, setTimeRange] = useState('this-month')

  return (
    <div className="filters">
      <ToggleGroup
        type="single"
        value={timeRange}
        onValueChange={setTimeRange}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/main:flex"
      >
        <ToggleGroupItem value="this-week">This Week</ToggleGroupItem>
        <ToggleGroupItem value="this-month">This Month</ToggleGroupItem>
        <ToggleGroupItem value="last-month">Last Month</ToggleGroupItem>
      </ToggleGroup>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/main:hidden"
          size="sm"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Today" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="this-week" className="rounded-lg">
            This Week
          </SelectItem>
          <SelectItem value="this-month" className="rounded-lg">
            This Month
          </SelectItem>
          <SelectItem value="last-month" className="rounded-lg">
            Last Month
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
