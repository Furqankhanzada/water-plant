'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { rupee } from '@/collections/Reports'

const chartConfig = {
  total: {
    label: 'Total',
    color: 'var(--chart-3)',
  },
  label: {
    color: 'var(--background)',
  },
} satisfies ChartConfig

interface BarChartHorizontalProps {
  title: string
  description: string
  secondaryDescription: string
  data: {
    label: string
    total: number
  }[]
}

export const BarChartHorizontal = ({
  title,
  description,
  secondaryDescription,
  data,
}: BarChartHorizontalProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px]">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 70,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="total" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="total" layout="vertical" fill="var(--color-total)" radius={4}>
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => rupee.format(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">{secondaryDescription}</div>
      </CardFooter>
    </Card>
  )
}
