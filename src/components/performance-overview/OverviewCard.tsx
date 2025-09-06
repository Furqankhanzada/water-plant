import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from '../ui/card'

interface OverviewCardProps {
  title: string
  value: string
  description: string
  secondaryDescription: string
}

export const OverviewCard = ({
  title,
  value,
  description,
  secondaryDescription,
}: OverviewCardProps) => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">{description}</div>
        <div className="text-muted-foreground">{secondaryDescription}</div>
      </CardFooter>
    </Card>
  )
}
