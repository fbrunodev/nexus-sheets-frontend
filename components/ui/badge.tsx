import * as React from "react"

export type BadgeVariant = "neutral" | "positive" | "negative" | "warning"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge-${variant} ${className}`}
      {...props}
    />
  )
}

// Compat shim — preserva a assinatura antiga
export function badgeVariants({ variant = "neutral" }: { variant?: BadgeVariant } = {}) {
  return `ui-badge ui-badge-${variant}`
}
