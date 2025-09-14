'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { rupee } from '@/collections/Reports'

interface BlockCollection {
  blockId?: string | null
  blockName?: string | null
  collected?: number | null
  remaining?: number | null
}

interface AreaCollection {
  areaId?: string | null
  areaName?: string | null
  collected?: number | null
  remaining?: number | null
  blocks?: BlockCollection[]
}

interface GeographicCollectionProps {
  areas: AreaCollection[]
  title?: string
  description?: string
  secondaryDescription?: string
}

export const GeographicCollection: React.FC<GeographicCollectionProps> = ({
  areas,
  title = "Collection by Area & Block",
  description = "Revenue collection breakdown by geographic location",
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

  return (
    <div className="grid grid-cols-1 gap-4 mt-4 @xl/main:grid-cols-1 @5xl/main:grid-cols-2">
      {/* Area Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {areas.map((area) => {
            const areaId = area.areaId || ''
            const areaName = area.areaName || 'Unknown Area'
            const collected = area.collected || 0
            const remaining = area.remaining || 0
            const blocks = area.blocks || []
            
            const isExpanded = expandedAreas.has(areaId)
            const collectionRate = collected + remaining > 0 
              ? ((collected / (collected + remaining)) * 100).toFixed(1)
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
                      <Badge variant="outline" className="text-green-600">
                        Collected: {rupee.format(collected)}
                      </Badge>
                      <Badge variant="outline" className="text-orange-600">
                        Remaining: {rupee.format(remaining)}
                      </Badge>
                      <Badge variant="secondary">
                        {collectionRate}% collected
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
                      const blockCollected = block.collected || 0
                      const blockRemaining = block.remaining || 0
                      
                      const blockCollectionRate = blockCollected + blockRemaining > 0
                        ? ((blockCollected / (blockCollected + blockRemaining)) * 100).toFixed(1)
                        : '0.0'

                      return (
                        <div key={blockId} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{blockName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-green-600">
                              {rupee.format(blockCollected)}
                            </span>
                            <span className="text-xs text-orange-600">
                              {rupee.format(blockRemaining)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {blockCollectionRate}%
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
