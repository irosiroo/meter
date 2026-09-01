"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Field } from "@/lib/calc/types";

type Value = string | boolean;

interface FieldControlProps {
  field: Field;
  value: Value;
  onChange: (value: Value) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
}

const labelCls = "block text-sm font-medium text-fg-muted mb-1.5";
const baseInput =
  "w-full rounded-xl bg-sunken border border-[rgb(var(--line)/0.14)] text-fg " +
  "px-3.5 py-2.5 text-[15px] tnum placeholder:text-fg-subtle " +
  "transition-[border-color,box-shadow] focus:border-brand-500/60 focus:outline-none " +
  "focus:ring-4 focus:ring-brand-500/12";

export function FieldControl({ field, value, onChange, onEnter, autoFocus }: FieldControlProps) {
  const kind = field.kind ?? "number";

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onEnter) onEnter();
  };

  if (kind === "toggle") {
    const on = Boolean(value);
    return (
      <div className={cn(field.wide && "sm:col-span-2")}>
        <label className="flex items-center justify-between gap-4 cursor-pointer group">
          <span>
            <span className="text-sm font-medium text-fg">{field.label}</span>
            {field.help && <span className="block text-xs text-fg-subtle mt-0.5">{field.help}</span>}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={field.label}
            onClick={() => onChange(!on)}
            className={cn(
              "relative h-[26px] w-11 shrink-0 rounded-full transition-colors duration-200",
              on ? "bg-brand-500" : "bg-[rgb(var(--line)/0.2)]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200",
                on && "translate-x-[18px]",
              )}
            />
          </button>
        </label>
      </div>
    );
  }

  if (kind === "select") {
    return (
      <div className={cn(field.wide && "sm:col-span-2")}>
        <label className={labelCls} htmlFor={field.key}>
          {field.label}
        </label>
        <div className="relative">
          <select
            id={field.key}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={cn(baseInput, "appearance-none pr-10 cursor-pointer")}
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
            size={16}
          />
        </div>
        {field.help && <p className="text-xs text-fg-subtle mt-1.5">{field.help}</p>}
      </div>
    );
  }

  if (kind === "textarea") {
    return (
      <div className={cn(field.wide && "sm:col-span-2")}>
        <label className={labelCls} htmlFor={field.key}>
          {field.label}
        </label>
        <textarea
          id={field.key}
          value={String(value)}
          placeholder={field.placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseInput, "resize-y min-h-[76px] leading-relaxed")}
        />
        {field.help && <p className="text-xs text-fg-subtle mt-1.5">{field.help}</p>}
      </div>
    );
  }

  const inputType = kind === "date" ? "date" : kind === "time" ? "time" : "text";
  const numeric = kind === "number";

  return (
    <div className={cn(field.wide && "sm:col-span-2")}>
      <label className={labelCls} htmlFor={field.key}>
        {field.label}
      </label>
      <div className="relative">
        <input
          id={field.key}
          type={inputType}
          inputMode={numeric ? "decimal" : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          className={cn(baseInput, field.unit && "pr-12")}
        />
        {field.unit && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-fg-subtle">
            {field.unit}
          </span>
        )}
      </div>
      {field.help && <p className="text-xs text-fg-subtle mt-1.5">{field.help}</p>}
    </div>
  );
}
