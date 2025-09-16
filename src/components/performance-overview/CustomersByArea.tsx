'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BlockCustomers {
  blockId?: string | null
  blockName?: string | null
  customerCount?: number | null
}

interface AreaCustomers {
  areaId?: string | null
  areaName?: string | null
  totalCustomers?: number | null
  blocks?: BlockCustomers[]
}

interface CustomersByAreaProps {
  areas: AreaCustomers[]
  title?: string
  description?: string
  secondaryDescription?: string
}

export const CustomersByArea: React.FC<CustomersByAreaProps> = ({
  areas,
  title = "Customers by Area & Block",
  description = "Customer distribution breakdown by geographic location",
  secondaryDescription,
}) => {
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())

  const toggleArea = (areaId: string) => {
    const newExpanded = new Set(expandedAreas)
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId)
    } else {
      newExpanded.add(areaId)
    }
    setExpandedAreas(newExpanded)
  }

  // Calculate total customers across all areas
  const totalCustomers = areas.reduce((sum, area) => sum + (area.totalCustomers || 0), 0)

  return (
    <div className="w-full">
      {/* Area Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
          {secondaryDescription && (
            <p className="text-xs text-muted-foreground">{secondaryDescription}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Summary */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-base">Total Active Customers</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {totalCustomers.toLocaleString()}
              </Badge>
            </div>
          </div>

          {areas.map((area) => {
            const areaId = area.areaId || ''
            const areaName = area.areaName || 'Unknown Area'
            const areaCustomers = area.totalCustomers || 0
            const blocks = area.blocks || []
            
            const isExpanded = expandedAreas.has(areaId)
            const percentage = totalCustomers > 0 && areaCustomers > 0 
              ? ((areaCustomers / totalCustomers) * 100).toFixed(1)
              : '0.0'

            return (
              <div key={areaId} className="border rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleArea(areaId)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-base">{areaName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-purple-600">
                        {areaCustomers.toLocaleString()} customers
                      </Badge>
                      <Badge variant="secondary">
                        {percentage}% of total
                      </Badge>
                    </div>
                  </div>
                  {blocks.length > 0 && (
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Block Details */}
                {isExpanded && blocks.length > 0 && (
                  <div className="mt-4 space-y-2 pl-4 border-l-2 border-muted">
                    {blocks.map((block) => {
                      const blockId = block.blockId || ''
                      const blockName = block.blockName || 'Unknown Block'
                      const blockCustomers = block.customerCount || 0
                      
                      const blockPercentage = areaCustomers > 0
                        ? ((blockCustomers / areaCustomers) * 100).toFixed(1)
                        : '0.0'

                      return (
                        <div key={blockId} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{blockName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-purple-600 font-medium">
                              {blockCustomers.toLocaleString()} customers
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {blockPercentage}%
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
