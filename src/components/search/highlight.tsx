"use client";

/**
 * Wraps matched query terms in <mark class="mark-hit"> for search highlighting.
 * Splitting on a capturing group keeps the delimiters; each captured chunk
 * equals a term, so a whole-string test tells us which pieces to mark.
 */

import { Fragment } from "react";
import { escapeRegExp } from "@/lib/utils";

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const terms = q
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length);
  if (terms.length === 0) return <>{text}</>;

  const splitter = new RegExp(`(${terms.join("|")})`, "ig");
  const test = new RegExp(`^(?:${terms.join("|")})$`, "i");

  return (
    <>
      {text.split(splitter).map((part, i) =>
        part && test.test(part) ? (
          <mark key={i} className="mark-hit">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
