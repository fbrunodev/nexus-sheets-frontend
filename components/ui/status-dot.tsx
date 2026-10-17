import * as React from "react"

const DOT_COLORS: Record<string, string> = {
  NOT_STARTED: "#5A5A62",
  IN_PROGRESS: "var(--accent)",
  FINISHED:    "var(--text-secondary)",
}

const DOT_LABELS: Record<string, string> = {
  NOT_STARTED: "Não iniciada",
  IN_PROGRESS: "Em andamento",
  FINISHED:    "Concluída",
}

interface StatusDotProps {
  status: string
  showLabel?: boolean
  size?: number
  style?: React.CSSProperties
}

export function StatusDot({ status, showLabel = true, size = 6, style }: StatusDotProps) {
  const color = DOT_COLORS[status] ?? "var(--text-muted)"
  const label = DOT_LABELS[status] ?? status

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", ...style }}>
      <span
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {showLabel && (
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {label}
        </span>
      )}
    </div>
  )
}

export { DOT_COLORS, DOT_LABELS }
