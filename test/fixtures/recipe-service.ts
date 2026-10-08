import { appendFile } from "node:fs/promises";
import type { TaskContext } from "../../src/index.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";

export async function effect(input: unknown, context: TaskContext) {
  if (!recipeObject(input) || typeof input.file !== "string")
    throw new Error("Expected effect file");
  await appendFile(input.file, `${context.idempotencyKey}\n`);
  context.reportUsage({ input: 2, output: 1, cached: 0 });
  return { accepted: true };
}
export function forbiddenService() {
  throw new Error("Unselected service was constructed");
}

export const serverTokens = () => [process.env.OUTPOST_RECIPE_QUEUE_TOKEN!];
export const clientToken = () => process.env.OUTPOST_RECIPE_QUEUE_TOKEN!;
export const scheduleRunId = (slot: Date) => `slot:${slot.toISOString()}`;

export async function nativeWorkflow() {
  const { defineTask, defineWorkflow } = await import("../../src/index.ts");
  return defineWorkflow("native-queued-workflow", [
    defineTask({
      key: "value",
      perform(context) {
        context.reportUsage({ input: 4, cached: 1, output: 2 });
        return { ready: true };
      },
    }),
  ]);
}

export const invalidHandler = 1;

export const scheduleInput = () => ({ ready: true, source: "callback" });
