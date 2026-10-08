import type { RecipeReport } from "../recipe-report.types.ts";
import type { RecipeReportDeclaration } from "./project.types.ts";

export function publishRecipeReport(
  report: RecipeReport,
  declarations: readonly RecipeReportDeclaration[],
  override?: "json",
): void {
  const selected: readonly RecipeReportDeclaration[] = override
    ? [{ type: "json", stream: "stdout" }]
    : declarations;
  for (const declaration of selected) {
    const output =
      declaration.type === "json"
        ? JSON.stringify(report)
        : [
            `${report.name}: ${report.status}`,
            ...Object.entries(report.outputs).flatMap(([key, fields]) =>
              Object.entries(fields)
                .filter(([field]) =>
                  ["text", "stdout", "stderr"].includes(field),
                )
                .map(([field, value]) => `[${key}] ${field}: ${value}`),
            ),
            ...(report.workspace.retainedDirectory
              ? [`Workspace retained: ${report.workspace.retainedDirectory}`]
              : []),
          ].join("\n");
    process[declaration.stream ?? "stdout"].write(`${output}\n`);
  }
}

export function printRecipeErrors(report: RecipeReport): void {
  for (const error of report.errors) {
    process.stderr.write(`${error.message}\n`);
    if (error.stderr) process.stderr.write(`${error.stderr}\n`);
  }
}
