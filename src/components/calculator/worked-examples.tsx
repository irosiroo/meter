import { specById } from "@/data/calculators";
import { mergeVals, runCompute } from "@/lib/calc/runtime";
import type { Vals } from "@/lib/calc/types";

/**
 * Server-rendered worked examples. Each authored example is executed at build
 * time through the very same `compute` users hit, so the printed result is
 * always real and always current — no hand-maintained answer strings.
 */
export function WorkedExamples({ slug }: { slug: string }) {
  const spec = specById(slug);
  if (!spec?.examples?.length) return null;

  const rows = spec.examples.map((ex) => {
    const res = runCompute(spec.compute, mergeVals(spec.fields, ex.inputs as Vals));
    const primary = res.ok ? res.output.rows.find((r) => r.tone === "primary") ?? res.output.rows[0] : null;
    return {
      label: ex.label,
      note: ex.note,
      result: primary ? `${primary.label} = ${primary.value}` : res.ok ? "—" : res.error,
    };
  });

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-fg">Worked examples</h2>
      <ul className="mt-4 divide-y divide-[rgb(var(--line)/0.1)] overflow-hidden rounded-2xl border border-[rgb(var(--line)/0.1)] bg-[rgb(var(--surface)/0.4)]">
        {rows.map((r, i) => (
          <li key={i} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">{r.label}</p>
              {r.note && <p className="mt-0.5 text-xs text-fg-subtle">{r.note}</p>}
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-brand-600 dark:text-brand-300">{r.result}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
