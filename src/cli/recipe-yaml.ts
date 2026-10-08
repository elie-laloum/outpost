import { createRecipeRuntime } from "../application/recipes/runtime.ts";
import { printRecipeErrors } from "../application/recipes/reports.ts";
import { nativeRecipeSchemas } from "../application/recipes/native-schemas.constants.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import { readRecipeFile } from "../infrastructure/recipes/read.ts";
import type { WorkflowOptions } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recipeYamlCommand(
  { values, positionals }: CliInvocation,
  inputs?: Readonly<Record<string, WorkflowJson>>,
): Promise<void> {
  if (!values.file || !values.config)
    throw new Error("Recipe requires --file and --config");
  const action = positionals[1];
  const runId = values["run-id"];
  if (action !== "run" && !runId)
    throw new Error(`Recipe ${action} requires --run-id`);
  const controller = new AbortController();
  const interrupt = () => {
    process.exitCode = 130;
    controller.abort();
  };
  const terminate = () => {
    process.exitCode = 143;
    controller.abort();
  };
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  try {
    await using runtime = await createRecipeRuntime({
      file: values.file,
      config: values.config,
    });
    if (action === "status") {
      const status = await runtime.status(runId!);
      process.stdout.write(
        values.json
          ? `${JSON.stringify(status ?? null)}\n`
          : `${runId}: ${status ? (status.owned ? "owned" : (status.report?.status ?? "interrupted")) : "not found"}\n`,
      );
      if (!status) process.exitCode = 1;
      return;
    }
    let intervention: Pick<WorkflowOptions, "answers" | "decisions"> = {};
    if (action === "answer" || action === "decide") {
      const path = action === "answer" ? values.answer : values.decision;
      if (!path)
        throw new Error(
          `Recipe ${action} requires --${action === "answer" ? "answer" : "decision"} file.json`,
        );
      intervention = validateRecipeSchema<
        Pick<WorkflowOptions, "answers" | "decisions">
      >(
        nativeRecipeSchemas["workflow.options"]!,
        {
          [action === "answer" ? "answers" : "decisions"]: [
            JSON.parse(await readRecipeFile(path)),
          ],
        },
        path,
      );
    }
    const settings = {
      ...(inputs ? { inputs } : {}),
      signal: controller.signal,
      ...(values.json ? { report: "json" as const } : {}),
    };
    const report =
      action === "run"
        ? await runtime.run({ ...settings, ...(runId ? { runId } : {}) })
        : await runtime.resume({
            ...settings,
            runId: runId!,
            ...intervention,
            ...(values["retry-incomplete"] ? { retryIncomplete: true } : {}),
            ...(values["recover-revision"]
              ? { recoverRevision: values["recover-revision"] }
              : {}),
          });
    printRecipeErrors(report);
    if (report.status !== "done" && !process.exitCode) process.exitCode = 1;
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  }
}
