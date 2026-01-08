import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "@/lib/types"

interface AvatarProps {
  user: User;
  className?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ user, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}
        title={`${user.displayName} (@${user.username})`}
      >
        {user.avatar ? (
          <img
            className="aspect-square h-full w-full"
            alt={user.displayName}
            src={user.avatar}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium text-sm">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
