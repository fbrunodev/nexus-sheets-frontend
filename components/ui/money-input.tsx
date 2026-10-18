"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { formatNumber } from "@/lib/format";

function parseMoneyStr(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
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
      setStr(raw === 0 ? "" : String(raw));
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
