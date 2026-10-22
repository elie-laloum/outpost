import type { RecipeEditorDiagnostic } from "./types.ts";

/** Diagnostics grouped by the scene node they belong to, such as `task:build`. */
export function diagnosticsByNode(
  diagnostics: readonly RecipeEditorDiagnostic[],
): Map<string, RecipeEditorDiagnostic[]> {
  const grouped = new Map<string, RecipeEditorDiagnostic[]>();
  for (const diagnostic of diagnostics) {
    if (!diagnostic.node) continue;
    grouped.set(diagnostic.node, [
      ...(grouped.get(diagnostic.node) ?? []),
      diagnostic,
    ]);
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
