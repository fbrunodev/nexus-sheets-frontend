import * as React from "react"

const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8C94' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ className = "", label, id, style, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`ui-select ${className}`}
        style={{
          backgroundImage: CARET,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
          ...style,
        }}
        {...props}
      />
    </div>
  )
}
