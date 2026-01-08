import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge as BadgeType } from "@/lib/types"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  badge: BadgeType;
}

const badgeLevelColors = {
  bronze: "bg-secondary text-foreground border-border",
  silver: "bg-secondary text-foreground border-border",
  gold: "bg-secondary text-foreground border-border",
  platinum: "bg-secondary text-foreground border-border",
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ badge, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
          badgeLevelColors[badge.level] || "bg-secondary text-foreground border-border",
          className
        )}
        title={badge.description}
        {...props}
      >
        <span>{badge.icon}</span>
        <span>{badge.name}</span>
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
