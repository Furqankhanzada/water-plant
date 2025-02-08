'use client'
import { CalendarIcon } from 'lucide-react'
import React from 'react'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function Page() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })
  return (
    <div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className={cn('grid gap-2', '')}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 pt-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="tracking-tight text-sm font-medium">Total Bottles</div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">375</div>
            <span className="text-xs text-muted-foreground">
              Total bottles which customers have at their home/office
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="tracking-tight text-sm font-medium">Total Bottles Delivered</div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">5000</div>
            <span className="text-xs text-muted-foreground">Total bottles sold this month</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="tracking-tight text-sm font-medium">Collected Amount</div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Rs 250000</div>
            <span className="text-xs text-muted-foreground">
              The amount collected for customers
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="tracking-tight text-sm font-medium">Due Amount</div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Rs 250000</div>
            <span className="text-xs text-muted-foreground">
              The amount needs to be collected from customers
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="tracking-tight text-sm font-medium">Due Amount</div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Rs 250000</div>
            <span className="text-xs text-muted-foreground">
              The amount needs to be collected from customers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
