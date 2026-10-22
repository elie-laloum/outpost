import type { RecipeEditorDiagnostic } from "./types.ts";

/** Recipe diagnostics grouped by the index of the task they locate. */
export function diagnosticsByTask(
  diagnostics: readonly RecipeEditorDiagnostic[],
): Map<number, RecipeEditorDiagnostic[]> {
  const grouped = new Map<number, RecipeEditorDiagnostic[]>();
  for (const diagnostic of diagnostics) {
    const [section, index] = diagnostic.path;
    if (
      diagnostic.file !== "recipe" ||
      section !== "tasks" ||
      typeof index !== "number"
    )
      continue;
    grouped.set(index, [...(grouped.get(index) ?? []), diagnostic]);
  }
  return grouped;
}

/** Converts a 1-based line and column to a document offset, clamped to the text. */
export function diagnosticOffset(
  text: string,
  line: number | undefined,
  column: number | undefined,
): number {
  if (!line) return 0;
  const lines = text.split("\n");
  const index = Math.min(Math.max(line, 1), lines.length) - 1;
  const start = lines
    .slice(0, index)
    .reduce((total, current) => total + current.length + 1, 0);
  return (
    start + Math.min(Math.max((column ?? 1) - 1, 0), lines[index]?.length ?? 0)
  );
}
