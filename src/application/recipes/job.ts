import { createRecipeRuntime } from "./runtime.ts";
import { triggerJobInput } from "../../domain/trigger-job.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { workflowJobResult, workflowJobVersion } from "../workflow-job.ts";
import type { QueueHandler } from "../queue-worker.types.ts";
import type { RecipeJobOptions } from "./service-components.types.ts";

export function defineRecipeJob(options: RecipeJobOptions): QueueHandler {
  return async (value, context) => {
    const { runId, input } = triggerJobInput(value);
    if (input !== null && !recipeObject(input))
      throw new Error("Recipe job input must be a parameter mapping or null");
    const inputs = Object.fromEntries(
      Object.entries(input ?? {}).map(([key, value]) => [
        key,
        recipeJson(value),
      ]),
    );
    await using runtime = await createRecipeRuntime(options);
    const previous = await runtime.status(runId);
    const settings = { runId, inputs, signal: context.signal };
    const report = previous
      ? await runtime.resume({
          ...settings,
          ...(options.retryIncomplete ? { retryIncomplete: true } : {}),
        })
      : await runtime.run(settings);
    if (!report.executionId || !report.usage)
      throw new Error(
        report.errors[0]?.message ??
          "Recipe job failed before workflow initialization",
      );
    return workflowJobResult(runId, workflowJobVersion("recipe", input), {
      ...report,
      executionId: report.executionId,
      usage: report.usage,
      errors: report.errors.map((error) => new Error(error.message)),
      inputRequests: report.inputRequests ?? [],
    });
  };
}
