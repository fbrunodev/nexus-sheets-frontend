import * as React from "react"

export type BadgeVariant = "neutral" | "positive" | "negative" | "warning"
export type BadgeSize = "default" | "sm"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

export function Badge({ variant = "neutral", size = "default", className = "", ...props }: BadgeProps) {
  const sizeClass = size === "sm" ? " ui-badge-sm" : ""
  return (
    <span
      className={`ui-badge ui-badge-${variant}${sizeClass} ${className}`}
      {...props}
    />
  )
}

// Compat shim — preserva a assinatura antiga
export function badgeVariants({ variant = "neutral" }: { variant?: BadgeVariant } = {}) {
  return `ui-badge ui-badge-${variant}`
}
