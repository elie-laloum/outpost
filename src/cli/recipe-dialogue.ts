import { recipeObject } from "../domain/recipes/values.ts";
import { selectRecipeActor } from "./recipe-actor.ts";
import { recipeGateDecision } from "./recipe-gates.ts";
import type { RecipeReport } from "../application/recipe-report.types.ts";
import type { RecipeRuntime } from "../application/recipes/project.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import type { RecipeDialogueOptions } from "./recipe-dialogue.types.ts";
import type { WorkflowInputRequest } from "../domain/workflow/input.types.ts";

function actorsFor(document: RecipeDocument, key: string): readonly string[] {
  const step = document.tasks.find((step) => step.key === key);
  const interaction = step?.options?.interaction;
  const actors =
    step?.interactive?.actors ??
    (recipeObject(interaction) ? interaction.actors : undefined);
  return Array.isArray(actors) &&
    actors.every((actor) => typeof actor === "string")
    ? actors
    : [];
}

async function answerFor(
  request: WorkflowInputRequest,
  { prompts, signal }: RecipeDialogueOptions,
): Promise<string | undefined> {
  if (!request.choices?.length) return prompts.text(request.question, signal);
  const choices = [...request.choices];
  if (request.allowFreeText !== false) choices.push("Enter another answer");
  const choice = await prompts.select(request.question, choices, signal);
  if (choice === undefined) return undefined;
  if (choice < request.choices.length) return request.choices[choice];
  return prompts.text(request.question, signal);
}

export async function continueRecipeDialogue(
  runtime: Pick<RecipeRuntime, "resume">,
  initial: RecipeReport,
  document: RecipeDocument,
  options: RecipeDialogueOptions,
): Promise<RecipeReport> {
  let report = initial;
  while (
    ["waiting-input", "paused"].includes(report.status) &&
    !options.signal.aborted
  ) {
    if (report.status === "paused") {
      const decision = await recipeGateDecision(report, document, options);
      if (!decision) break;
      report = await runtime.resume({
        runId: report.runId!,
        signal: options.signal,
        decisions: [decision],
      });
      continue;
    }
    const request = report.inputRequests?.[0];
    if (!request || !report.runId)
      throw new Error(
        "Interactive recipe requires a persisted question and run ID",
      );
    const actor = await selectRecipeActor(
      actorsFor(document, request.key),
      request.key,
      options,
    );
    const value =
      actor === undefined ? undefined : await answerFor(request, options);
    if (actor === undefined || value === undefined) {
      options.cancel();
      break;
    }
    if (options.signal.aborted) break;
    report = await runtime.resume({
      runId: report.runId,
      signal: options.signal,
      answers: [
        {
          executionId: request.executionId,
          key: request.key,
          requestId: request.id,
          actor,
          value,
        },
      ],
    });
  }
  return report;
}
