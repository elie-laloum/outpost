import { positive } from "../../domain/workflow/validation.ts";
import { maxTimerMs } from "../../domain/workflow/retry.constants.ts";
import { workflowAccounting } from "../../domain/workflow/budget.ts";
import { validateQuotaPolicy } from "../../domain/workflow/quota-pause.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";

export function validateRecipeWorkflowSettings(
  document: RecipeDocument,
  components: RecipeWorkflowComponents,
): void {
  const settings = components.workflow;
  if (settings.concurrency !== undefined)
    positive(settings.concurrency, "concurrency");
  if (settings.timeoutMs !== undefined) {
    positive(settings.timeoutMs, "Workflow timeoutMs");
    if (settings.timeoutMs > maxTimerMs)
      throw new Error("Workflow timeoutMs exceeds the supported timer range");
  }
  workflowAccounting(settings.budget, () => {});
  if (settings.onQuota) validateQuotaPolicy(settings.onQuota);
  if (settings.checkpoint) {
    if (
      !settings.checkpoint.runId.trim() ||
      !settings.checkpoint.version.trim()
    )
      throw new Error("Checkpoint runId and version must not be empty");
  }
  if (
    !settings.checkpoint &&
    (settings.onQuota ||
      settings.answers?.length ||
      settings.decisions?.length ||
      Object.values(components.steps).some(
        (step) =>
          step.gate ||
          step.interactive ||
          step.options?.gate ||
          step.options?.interaction,
      ))
  )
    throw new Error(
      "Recipe quota pauses, gates and interactions require a checkpoint",
    );
  if (settings.answers && !settings.answers.length)
    throw new Error("Workflow answers cannot be empty");
  if (settings.decisions && !settings.decisions.length)
    throw new Error("Workflow decisions cannot be empty");
  const ancestors = new Map<string, Set<string>>();
  for (const step of document.tasks)
    ancestors.set(
      step.key,
      new Set(
        step.after.flatMap((key) => [key, ...(ancestors.get(key) ?? [])]),
      ),
    );
  if ((settings.concurrency ?? 1) === 1) return;
  for (const [index, left] of document.tasks.entries()) {
    const first = components.steps[left.key]?.isolated;
    if (!first) continue;
    for (const right of document.tasks.slice(index + 1)) {
      const second = components.steps[right.key]?.isolated;
      if (!second || ancestors.get(right.key)?.has(left.key)) continue;
      if (
        (first.workspace && first.workspace === second.workspace) ||
        (first.repository === second.repository &&
          ((first.branch?.mode === "current" &&
            second.branch?.mode === "current") ||
            (first.branch?.mode === "named" &&
              second.branch?.mode === "named" &&
              first.branch.name === second.branch.name)))
      )
        throw new Error(
          `Concurrent isolated tasks ${left.key} and ${right.key} use the same workspace`,
        );
    }
  }
}
