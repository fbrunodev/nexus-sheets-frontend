"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

// Root
export function Modal(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

// Trigger
export function ModalTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

// Content — overlay + panel Card + close button
export function ModalContent({
  children,
  title,
  description,
  maxWidth = 480,
  showClose = true,
  className = "",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  title?: React.ReactNode
  description?: React.ReactNode
  maxWidth?: number
  showClose?: boolean
}) {
  return (
    <DialogPrimitive.Portal>
      {/* Overlay */}
      <DialogPrimitive.Overlay
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "var(--overlay)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* Panel */}
        <DialogPrimitive.Content
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            width: "100%",
            maxWidth: `${maxWidth}px`,
            maxHeight: "calc(100dvh - 32px)",
            overflowY: "auto",
            outline: "none",
            position: "relative",
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
          }}
          {...props}
        >
          {/* Header */}
          {(title || showClose) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {title && (
                <DialogPrimitive.Title
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {title}
                </DialogPrimitive.Title>
              )}
              {!title && <span />}
              {showClose && (
                <DialogPrimitive.Close
                  aria-label="Fechar"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <DialogPrimitive.Description
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                padding: "12px 20px 0",
                margin: 0,
              }}
            >
              {description}
            </DialogPrimitive.Description>
          )}

          {/* Body */}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

// Body padding wrapper
export function ModalBody({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", ...style }}
      {...props}
    />
  )
}

// Footer with action buttons
export function ModalFooter({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        padding: "12px 20px",
        borderTop: "1px solid var(--border)",
        ...style,
      }}
      {...props}
    />
  )
}

// Close trigger (for use inside ModalFooter)
export function ModalClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}
