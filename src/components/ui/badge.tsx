import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "brand" | "muted" | "outline";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-[rgb(var(--surface)/0.8)] text-fg-muted ring-1 ring-inset ring-[rgb(var(--line)/0.12)]",
  brand: "bg-brand-500/12 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20",
  muted: "bg-sunken text-fg-subtle",
  outline: "text-fg-muted ring-1 ring-inset ring-[rgb(var(--line)/0.18)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
