'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BlockBottlesDelivered {
  blockId?: string | null
  blockName?: string | null
  totalBottles?: number | null
}

interface AreaBottlesDelivered {
  areaId?: string | null
  areaName?: string | null
  totalBottles?: number | null
  blocks?: BlockBottlesDelivered[]
}

interface BottlesDeliveredByAreaProps {
  areas: AreaBottlesDelivered[]
  title?: string
  description?: string
  secondaryDescription?: string
}

export const BottlesDeliveredByArea: React.FC<BottlesDeliveredByAreaProps> = ({
  areas,
  title = "Bottles Delivered by Area & Block",
  description = "Bottles delivered breakdown by geographic location",
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

  // Calculate total bottles across all areas
  const totalBottles = areas.reduce((sum, area) => sum + (area.totalBottles || 0), 0)

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
              <span className="font-medium text-base">Total Bottles Delivered</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {totalBottles.toLocaleString()}
              </Badge>
            </div>
          </div>

          {areas.map((area) => {
            const areaId = area.areaId || ''
            const areaName = area.areaName || 'Unknown Area'
            const areaBottles = area.totalBottles || 0
            const blocks = area.blocks || []
            
            const isExpanded = expandedAreas.has(areaId)
            const percentage = totalBottles > 0 && areaBottles > 0 
              ? ((areaBottles / totalBottles) * 100).toFixed(1)
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
                      <Badge variant="outline" className="text-blue-600">
                        {areaBottles.toLocaleString()} bottles
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
                      const blockBottles = block.totalBottles || 0
                      
                      const blockPercentage = areaBottles > 0
                        ? ((blockBottles / areaBottles) * 100).toFixed(1)
                        : '0.0'

                      return (
                        <div key={blockId} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{blockName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-blue-600 font-medium">
                              {blockBottles.toLocaleString()} bottles
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
