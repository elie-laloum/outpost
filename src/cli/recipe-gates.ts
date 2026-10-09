import { selectRecipeActor } from "./recipe-actor.ts";
import { stripVTControlCharacters } from "node:util";
import type { RecipeReport } from "../application/recipe-report.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import type { WorkflowDecision } from "../domain/workflow/gates.types.ts";
import type { RecipeDialogueOptions } from "./recipe-dialogue.types.ts";

export async function recipeGateDecision(
  report: RecipeReport,
  document: RecipeDocument,
  options: RecipeDialogueOptions,
): Promise<WorkflowDecision | undefined> {
  const task = report.tasks.find(
    (task) =>
      task.status === "paused" &&
      task.pause &&
      task.pause.authentication !== "signed",
  );
  if (!task?.pause) return undefined;
  if (!report.executionId || !report.runId)
    throw new Error(
      "Interactive gate requires a persisted execution and run ID",
    );
  const gate = task.pause;
  const actor = await selectRecipeActor(gate.actors, task.key, options);
  if (actor === undefined) {
    options.cancel();
    return undefined;
  }
  for (const key of document.tasks.find((step) => step.key === task.key)
    ?.after ?? []) {
    const output = report.outputs[key];
    if (output === undefined) continue;
    const value =
      typeof output.text === "string"
        ? output.text
        : JSON.stringify(output, null, 2);
    options.prompts.write?.(
      stripVTControlCharacters(`\n--- ${key} ---\n${value}\n`),
    );
  }
  const action = gate.kind === "approval" ? "approve" : "resume";
  const selected = await options.prompts.select(
    gate.prompt,
    ["Leave pending", action === "approve" ? "Approve" : "Resume", "Reject"],
    options.signal,
  );
  if (selected === undefined) {
    options.cancel();
    return undefined;
  }
  if (selected === 0) return undefined;
  const reason = await options.prompts.text(
    "Reason for this decision",
    options.signal,
  );
  if (reason === undefined) {
    options.cancel();
    return undefined;
  }
  if (options.signal.aborted) return undefined;
  return {
    executionId: report.executionId,
    key: task.key,
    requestId: gate.id,
    action: selected === 1 ? action : "reject",
    actor,
    reason,
  };
}
