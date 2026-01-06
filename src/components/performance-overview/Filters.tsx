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
  
  const timeRange = searchParams.get('duration') || 'this-month'
  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''

  const updateParams = useCallback((next: { duration?: string; start?: string | null; end?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next.duration !== undefined) {
      params.set('duration', next.duration)
      if (next.duration !== 'custom') {
        params.delete('start')
        params.delete('end')
      }
    }
    if (next.start !== undefined) {
      if (next.start) params.set('start', next.start)
      else params.delete('start')
    }
    if (next.end !== undefined) {
      if (next.end) params.set('end', next.end)
      else params.delete('end')
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const handleDurationChange = useCallback((value: string) => {
    updateParams({ duration: value })
  }, [updateParams])

  const handleStartChange = useCallback((value: string) => {
    const endParam = searchParams.get('end') || value
    updateParams({ duration: 'custom', start: value || null, end: endParam || null })
  }, [searchParams, updateParams])

  const handleEndChange = useCallback((value: string) => {
    const startParam = searchParams.get('start') || value
    updateParams({ duration: 'custom', end: value || null, start: startParam || null })
  }, [searchParams, updateParams])

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
        <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
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
          <SelectItem value="custom" className="rounded-lg">
            Custom
          </SelectItem>
        </SelectContent>
      </Select>
      {timeRange === 'custom' ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={start}
            onChange={(e) => handleStartChange(e.target.value)}
            className="rounded-md border bg-transparent px-2 py-1 text-sm"
            aria-label="Start date"
          />
          <span className="text-sm opacity-70">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => handleEndChange(e.target.value)}
            className="rounded-md border bg-transparent px-2 py-1 text-sm"
            aria-label="End date"
          />
        </div>
      ) : null}
    </div>
  )
}
