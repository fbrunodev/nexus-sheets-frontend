"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { formatNumber } from "@/lib/format";

function parseMoneyStr(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const hasComma = t.includes(",");
  const hasDot   = t.includes(".");

  if (hasComma && hasDot) {
    // Last separator is decimal; remove the other
    return t.lastIndexOf(",") > t.lastIndexOf(".")
      ? parseFloat(t.replace(/\./g, "").replace(",", ".")) || 0  // "1.000,50"
      : parseFloat(t.replace(/,/g, "")) || 0;                    // "1,000.50"
  }

  if (hasComma) {
    // Only comma → comma is decimal: "1000,50" → 1000.50
    return parseFloat(t.replace(",", ".")) || 0;
  }

  if (hasDot) {
    const dotCount = (t.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots → all are thousand separators: "1.000.000" → 1000000
      return parseFloat(t.replace(/\./g, "")) || 0;
    }
    const afterDot = t.split(".")[1] ?? "";
    if (afterDot.length === 3) {
      // Single dot + exactly 3 digits → thousand separator: "1.000" → 1000
      return parseFloat(t.replace(".", "")) || 0;
    }
    // Single dot + 1–2 digits → decimal: "1.5" → 1.5, "150.50" → 150.50
    return parseFloat(t) || 0;
  }

  // No separator → integer: "1000" → 1000
  return parseFloat(t) || 0;
}

export interface MoneyInputProps {
  value?: number;
  onBlur?: (value: number) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    { value = 0, onBlur: onBlurProp, onKeyDown, disabled, autoFocus, placeholder = "0,00", style, inputStyle },
    forwardedRef
  ) {
    const [str, setStr] = useState(() => (value > 0 ? formatNumber(value) : ""));
    const isEditing = useRef(false);

    useEffect(() => {
      if (!isEditing.current) {
        setStr(value > 0 ? formatNumber(value) : "");
      }
    }, [value]);

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      isEditing.current = true;
      const raw = parseMoneyStr(str);
      setStr(raw === 0 ? "" : raw.toFixed(2).replace(".", ","));
      const el = e.currentTarget;
      requestAnimationFrame(() => el?.select());
    }

    function handleBlur() {
      isEditing.current = false;
      const parsed = parseMoneyStr(str);
      setStr(parsed > 0 ? formatNumber(parsed) : "");
      onBlurProp?.(parsed);
    }

    return (
      <div className="ui-cell" style={style}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "5px", flexShrink: 0 }}>
          R$
        </span>
        <input
          ref={forwardedRef}
          type="text"
          inputMode="decimal"
          value={str}
          onChange={(e) => setStr(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text)",
            outline: "none",
            width: "100%",
            fontFamily: "inherit",
            fontSize: "13px",
            padding: "7px 0",
            ...inputStyle,
          }}
        />
      </div>
    );
  }
);
