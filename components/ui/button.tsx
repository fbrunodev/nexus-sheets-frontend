import * as React from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: boolean
}

export function Button({
  variant = "secondary",
  size = "md",
  icon = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const cls = [
    "ui-btn",
    `ui-btn-${variant}`,
    size !== "md" ? `ui-btn-${size}` : "",
    icon ? "ui-btn-icon" : "",
    className,
  ].filter(Boolean).join(" ")

  return <button type={type} className={cls} {...props} />
}

// Compat shim — dialog.tsx usa buttonVariants
export function buttonVariants({
  variant = "secondary",
  size = "md",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return [
    "ui-btn",
    `ui-btn-${variant}`,
    size !== "md" ? `ui-btn-${size}` : "",
    className,
  ].filter(Boolean).join(" ")
}
