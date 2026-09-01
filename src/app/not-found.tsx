import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-gradient text-7xl font-bold tracking-tight sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-fg">Page not found</h1>
      <p className="mt-2 max-w-sm leading-relaxed text-fg-muted">
        The tool or page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "primary", size: "md" })}>
          Back home
        </Link>
        <Link href="/all-tools" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
