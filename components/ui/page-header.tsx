import * as React from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: subtitle ? "flex-start" : "center",
        marginBottom: "28px",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)", lineHeight: "1.2" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
