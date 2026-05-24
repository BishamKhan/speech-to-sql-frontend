import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4"
  className?: string
}

const accentStyles: Record<string, { bg: string; icon: string; glow: string }> = {
  primary:  { bg: "bg-primary/10",   icon: "text-primary",   glow: "shadow-primary/20" },
  "chart-2":{ bg: "bg-chart-2/10",   icon: "text-chart-2",   glow: "shadow-chart-2/20" },
  "chart-3":{ bg: "bg-chart-3/10",   icon: "text-chart-3",   glow: "shadow-chart-3/20" },
  "chart-4":{ bg: "bg-chart-4/10",   icon: "text-chart-4",   glow: "shadow-chart-4/20" },
}

export function StatsCard({ title, value, icon: Icon, trend, accent = "primary", className }: StatsCardProps) {
  const styles = accentStyles[accent] ?? accentStyles.primary

  return (
    <Card className={cn(
      "border-border/60 bg-card/80 shadow-sm backdrop-blur-sm overflow-hidden relative group hover:shadow-md transition-shadow",
      className
    )}>
      {/* Subtle top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, var(--color-${accent}), transparent)` }}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              )}>
                <span>{trend.isPositive ? "▲" : "▼"}</span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
            styles.bg, styles.glow
          )}>
            <Icon className={cn("h-5 w-5", styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
