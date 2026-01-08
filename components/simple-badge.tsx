import * as React from "react"
import { cn } from "@/lib/utils"

interface SimpleBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

const simpleVariantStyles = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

export function SimpleBadge({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: SimpleBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
        simpleVariantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
