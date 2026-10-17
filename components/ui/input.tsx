import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ className = "", label, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`ui-input ${className}`}
        {...props}
      />
    </div>
  )
}
