"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { formatNumber } from "@/lib/format";

function parseMoneyStr(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const hasComma = t.includes(",");
  const hasDot   = t.includes(".");
  if (hasComma && hasDot) {
    return t.lastIndexOf(",") > t.lastIndexOf(".")
      ? parseFloat(t.replace(/\./g, "").replace(",", ".")) || 0  // "1.000,50"
      : parseFloat(t.replace(/,/g, "")) || 0;                    // "1,000.50"
  }
  if (hasComma) return parseFloat(t.replace(",", ".")) || 0;     // "1000,50"
  return parseFloat(t) || 0;                                     // "1000.50"
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
