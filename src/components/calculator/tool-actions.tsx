"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "@/components/tools/favorite-button";
import { cn, shareLink } from "@/lib/utils";

export function ToolActions({ id, name, className }: { id: string; name: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const res = await shareLink({ title: `${name} — METER`, text: `${name} on METER`, url: window.location.href });
    if (res === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={share}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[rgb(var(--line)/0.18)] px-3.5 text-sm font-medium text-fg-muted transition-colors hover:bg-[rgb(var(--surface)/0.5)] hover:text-fg"
      >
        {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
        {copied ? "Copied" : "Share"}
      </button>
      <FavoriteButton
        id={id}
        showLabel
        className="h-10 rounded-2xl border border-[rgb(var(--line)/0.18)] px-3.5 hover:bg-[rgb(var(--surface)/0.5)]"
      />
    </div>
  );
}
