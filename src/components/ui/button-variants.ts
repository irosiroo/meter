import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button style variants — kept in a server-safe module (no "use client") so
 * Server Components (empty states, hero CTAs, 404) can call `buttonVariants()`
 * to style a plain <Link>. The interactive <Button> in ./button re-exports it.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium " +
    "transition-[transform,background-color,box-shadow,color] duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:brightness-[1.06]",
        solid: "bg-fg text-canvas hover:opacity-90",
        glass: "glass text-fg hover:bg-[rgb(var(--surface)/calc(var(--surface-alpha)+0.1))]",
        outline:
          "border border-[rgb(var(--line)/0.18)] bg-transparent text-fg hover:bg-[rgb(var(--surface)/0.5)]",
        ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-[rgb(var(--surface)/0.55)]",
        subtle: "bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-500/16",
        danger: "bg-rose-500/12 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-[3.25rem] px-7 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
