"use client";

import { useState, useRef, useEffect } from "react";

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function NumberInput({
  value = 0,
  onChange,
  onBlur: onBlurProp,
  min,
  max,
  allowDecimal = false,
  placeholder,
  disabled,
  className,
  style,
}: NumberInputProps) {
  const [str, setStr] = useState(() => (value > 0 ? String(value) : ""));
  const isEditing = useRef(false);

  useEffect(() => {
    if (!isEditing.current) {
      setStr(value > 0 ? String(value) : "");
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value;
    if (allowDecimal) {
      raw = raw.replace(/[^0-9,]/g, "");
      const parts = raw.split(",");
      if (parts.length > 2) raw = parts[0] + "," + parts.slice(1).join("");
    } else {
      raw = raw.replace(/[^0-9]/g, "");
    }
    setStr(raw);
    onChange?.(parseFloat(raw.replace(",", ".")) || 0);
  }

  function handleFocus() {
    isEditing.current = true;
  }

  function handleBlur() {
    isEditing.current = false;
    let parsed = parseFloat(str.replace(",", ".")) || 0;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    const displayStr = parsed > 0
      ? (allowDecimal ? String(parsed).replace(".", ",") : String(parsed))
      : "";
    setStr(displayStr);
    onChange?.(parsed);
    onBlurProp?.(parsed);
  }

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={str}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={style}
    />
  );
}
