import { TriangleAlert } from "lucide-react";
import type { RecipeEditorDiagnostic } from "@/lib/types";

/** Diagnostics located on the selected node, with their hints. */
export function Problems({
  problems,
}: {
  readonly problems: readonly RecipeEditorDiagnostic[];
}) {
  if (!problems.length) return null;
  return (
    <ul className="flex flex-col gap-2" aria-label="Problems">
      {problems.map((problem, index) => (
        <li
          key={index}
          className="flex gap-2 border border-destructive/40 bg-destructive/10 p-2 text-xs"
        >
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0 text-destructive"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <span>{problem.message}</span>
            {problem.hint && (
              <span className="text-muted-foreground">{problem.hint}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
