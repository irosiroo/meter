/**
 * METER · brand mark
 * ---------------------------------------------------------------------------
 * A geometric "M" drawn as a single measured stroke sitting on a baseline tick
 * (the "meter" motif), painted with the brand gradient. Pure/server-safe — no
 * hooks — so it can render anywhere. The gradient id is fixed; duplicate defs
 * on a page resolve to the same visual, which is fine.
 */

import { cn } from "@/lib/utils";
import { SITE } from "@/lib/utils";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="meterMark" x1="4" y1="6" x2="28" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--logo-a, #3b82f6)" />
          <stop offset="1" stopColor="var(--logo-b, #22d3ee)" />
        </linearGradient>
      </defs>
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="8.5" className="fill-brand-500/10 stroke-brand-500/25" strokeWidth="1" />
      <path
        d="M6.5 23V10.2c0-.5.62-.74.96-.37L16 19l8.54-9.17c.34-.37.96-.13.96.37V23"
        stroke="url(#meterMark)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.5 26.4h19" stroke="url(#meterMark)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function Logo({
  size = 34,
  withWordmark = true,
  subtitle = false,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  subtitle?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.15rem] font-bold tracking-tight text-fg">{SITE.name}</span>
          {subtitle && (
            <span className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-fg-subtle">
              {SITE.subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
