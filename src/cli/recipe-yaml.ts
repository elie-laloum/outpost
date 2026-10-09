import { createRecipeProjectRuntime } from "../application/recipes/runtime.ts";
import { readRecipeProject } from "../application/recipes/project.ts";
import {
  printRecipeErrors,
  publishRecipeReport,
} from "../application/recipes/reports.ts";
import { continueRecipeDialogue } from "./recipe-dialogue.ts";
import {
  createRecipeInputPrompts,
  recipeInteractiveMode,
} from "./recipe-terminal.ts";
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
  if (action !== "run" && action !== "serve" && !runId)
    throw new Error(`Recipe ${action} requires --run-id`);
  const interactive = recipeInteractiveMode(values);
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
    const project = await readRecipeProject({
      file: values.file,
      config: values.config,
    });
    await using runtime = createRecipeProjectRuntime(project, () => {});
    if (action === "serve") {
      if (!values.service) throw new Error("Recipe serve requires --service");
      await runtime.serve({
        service: values.service,
        signal: controller.signal,
      });
      return;
    }
    if (action === "enqueue") {
      if (!values.queue || !values.handler)
        throw new Error("Recipe enqueue requires --queue and --handler");
      const job = await runtime.enqueue({
        queue: values.queue,
        handler: values.handler,
        runId: runId!,
        ...(inputs ? { inputs } : {}),
        signal: controller.signal,
        ...(values["job-id"] ? { id: values["job-id"] } : {}),
        ...(values["idempotency-key"]
          ? { idempotencyKey: values["idempotency-key"] }
          : {}),
        ...(values.deadline ? { deadline: Number(values.deadline) } : {}),
      });
      if (values.json) process.stdout.write(`${JSON.stringify(job)}\n`);
      return;
    }
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
    let report =
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
    if (interactive)
      report = await continueRecipeDialogue(runtime, report, project.document, {
        ...(values.actor !== undefined ? { actor: values.actor } : {}),
        signal: controller.signal,
        prompts: createRecipeInputPrompts(),
        cancel() {
          if (!controller.signal.aborted) interrupt();
        },
      });
    publishRecipeReport(
      report,
      project.reports,
      values.json ? "json" : undefined,
    );
    printRecipeErrors(report);
    if (report.status === "waiting-input" && !values.json)
      process.stderr.write(
        `Recipe ${report.runId} is waiting for input. Use outpost recipe resume with the same --file, --config and --run-id.\n`,
      );
    if (
      report.status === "paused" &&
      report.tasks.some((task) => task.pause) &&
      !values.json
    )
      process.stderr.write(
        `Recipe ${report.runId} is waiting for a gate decision. Resume interactively or use outpost recipe decide --decision decision.json; signed gates require a proof.\n`,
      );
    if (report.status !== "done" && !process.exitCode) process.exitCode = 1;
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  }
}
