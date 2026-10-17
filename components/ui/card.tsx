import * as React from "react"

export type CardVariant = "default" | "compact"
export type CardTone = "positive" | "negative"

const TONE_BORDER: Record<CardTone, string> = {
  positive: "2px solid var(--positive-border)",
  negative: "2px solid var(--negative-border)",
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  highlight?: boolean
  tone?: CardTone
}

export function Card({
  variant = "default",
  highlight,
  tone,
  style,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        background: highlight ? "var(--surface-hover)" : "var(--surface)",
        border: tone ? TONE_BORDER[tone] : "1px solid var(--border)",
        borderRadius: variant === "compact" ? "8px" : "12px",
        ...style,
      }}
      {...props}
    />
  )
}

export function CardHeader({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        ...style,
      }}
      {...props}
    />
  )
}

export function CardTitle({
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <p
      style={{
        fontSize: "15px",
        fontWeight: "600",
        color: "var(--text)",
        ...style,
      }}
      {...props}
    />
  )
}

export function CardDescription({
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      style={{
        fontSize: "13px",
        color: "var(--text-secondary)",
        ...style,
      }}
      {...props}
    />
  )
}

export function CardContent({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ padding: "20px", ...style }}
      {...props}
    />
  )
}

export function CardFooter({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        padding: "12px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        ...style,
      }}
      {...props}
    />
  )
}

// Kept for backward compat
export function CardAction(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}
