"use client";
import { useLayoutEffect, useRef, useState } from "react";

/* Bar segmen teks dengan garis penanda di bawah tab aktif, seperti pemilih
   Emoji / Stickers / GIFs. Garis bergeser mengikuti tab yang dipilih.
   Warna diambil dari token --ui-*, jadi komponen ini sama di kedua situs. */
export function Segments<T extends string>({
  items,
  value,
  onChange,
  label,
  className = "",
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = wrap.current?.querySelector<HTMLButtonElement>(`[data-seg="${value}"]`);
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [value, items.length]);

  return (
    <div
      ref={wrap}
      role="tablist"
      aria-label={label}
      className={`relative flex items-stretch gap-1 overflow-x-auto border-b border-[color:var(--ui-line)] [scrollbar-width:none] ${className}`}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            data-seg={it.id}
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={`relative shrink-0 whitespace-nowrap px-3 pb-2.5 sm:px-4 pt-2 text-sm font-medium outline-offset-[-2px] transition-colors duration-200 ${
              active
                ? "text-[color:var(--ui-accent)]"
                : "text-[color:var(--ui-muted)] hover:text-[color:var(--ui-text)]"
            }`}
          >
            {it.label}
            {typeof it.count === "number" && (
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{it.count}</span>
            )}
          </button>
        );
      })}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-1px] h-[3px] rounded-full bg-[color:var(--ui-accent)] transition-[left,width] duration-300 ease-out"
        style={{ left: bar.left + 10, width: Math.max(0, bar.width - 20) }}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 py-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span className="min-w-0">
        <span className="block text-sm text-[color:var(--ui-text)]">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-[color:var(--ui-muted)]">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-[color:var(--ui-accent)]" : "bg-[color:var(--ui-line-strong)]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200 ${
            checked ? "left-[21px]" : "left-[3px]"
          }`}
        />
      </button>
    </label>
  );
}
