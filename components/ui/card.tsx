import * as React from "react"

export function Card({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
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
