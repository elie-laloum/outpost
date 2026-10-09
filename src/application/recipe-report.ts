import { OutpostError } from "../domain/errors.ts";
import {
  recipeReportLimits,
  recipeOutputFields,
} from "./recipe-report.constants.ts";
import type { RecipeDiagnostic, RecipeReport } from "./recipe-report.types.ts";

function bounded(text: string): string {
  if (text.length <= recipeReportLimits.characters) return text;
  return `${text.slice(0, recipeReportLimits.characters)}\n[truncated]`;
}

export function recipeOutput(value: unknown): Record<string, string | number> {
  if (!value || typeof value !== "object") return {};
  const entries = new Map(Object.entries(value));
  return Object.fromEntries(
    recipeOutputFields.flatMap<[string, string | number]>((key) => {
      const field = entries.get(key);
      if (typeof field === "string") return [[key, bounded(field)]];
      if (typeof field === "number" && Number.isFinite(field))
        return [[key, field]];
      return [];
    }),
  );
}

export function recipeDiagnostic(error: unknown, depth = 0): RecipeDiagnostic {
  const details = error instanceof OutpostError ? error.details : {};
  return {
    ...(typeof details.publicationId === "string"
      ? { publicationId: details.publicationId }
      : {}),
    ...(typeof details.state === "string"
      ? { publicationState: details.state }
      : {}),
    message: bounded(error instanceof Error ? error.message : String(error)),
    ...(error instanceof OutpostError ? { code: error.code } : {}),
    ...(typeof details.status === "number" ? { status: details.status } : {}),
    ...(typeof details.stdout === "string"
      ? { stdout: bounded(details.stdout) }
      : {}),
    ...(typeof details.stderr === "string"
      ? { stderr: bounded(details.stderr) }
      : {}),
    ...(error instanceof Error &&
    error.cause !== undefined &&
    depth < recipeReportLimits.causeDepth
      ? { cause: recipeDiagnostic(error.cause, depth + 1) }
      : {}),
  };
}

export function printRecipeReport(report: RecipeReport, json: boolean): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(report)}\n`);
    return;
  }
  process.stdout.write(`${report.name}: ${report.status}\n`);
  for (const [key, output] of Object.entries(report.outputs)) {
    for (const field of ["stdout", "stderr", "text"] as const) {
      const value = output[field];
      if (typeof value === "string" && value)
        process.stdout.write(
          `[${key}] ${field}\n${value}${value.endsWith("\n") ? "" : "\n"}`,
        );
    }
  }
  for (const error of report.errors) {
    process.stderr.write(`${error.message}\n`);
    if (error.stdout) process.stderr.write(`${error.stdout}\n`);
    if (error.stderr) process.stderr.write(`${error.stderr}\n`);
  }
  if (report.workspace?.retainedDirectory)
    process.stdout.write(
      `Workspace retained: ${report.workspace?.retainedDirectory}\n`,
    );
}
