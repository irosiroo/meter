import { ToolGrid } from "@/components/tools/tool-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { TOOL_BY_ID } from "@/data/tools.generated";
import { relatedTools } from "@/lib/tools";
import type { CategoryId } from "@/lib/calc/types";

export function RelatedTools({ currentId, category }: { currentId: string; category: CategoryId }) {
  const current = TOOL_BY_ID[currentId];
  const related = current ? relatedTools(current, 6) : [];
  if (related.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionHeading
        title="Related tools"
        action={{ href: `/categories/${category}`, label: "More in this category" }}
      />
      <ToolGrid tools={related} className="mt-6" />
    </section>
  );
}
