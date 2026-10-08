import { createCronSchedule } from "../../domain/cron.ts";
import { createSqliteTaskQueue } from "../../infrastructure/task-queue.ts";
import { serveTaskQueue } from "../../infrastructure/task-queue-http.ts";
import { serveTriggers } from "../../infrastructure/trigger-server.ts";
import { runQueueWorker } from "../queue-worker.ts";
import { runSchedules } from "../schedules.ts";
import type { TriggerSchedule } from "../schedules.types.ts";
import type {
  RecipeService,
  RecipeSqliteOptions,
  RecipeCronOptions,
  RecipeWorkerOptions,
  RecipeScheduleOptions,
  RecipeQueueServerOptions,
  RecipeTriggerServerOptions,
  RecipeTriggerMapperOptions,
  RecipeTriggerMapper,
  RecipeScheduleDeclaration,
} from "./service-components.types.ts";

export function createRecipeSqliteQueue(options: RecipeSqliteOptions) {
  return createSqliteTaskQueue(options.file);
}
export function createRecipeCron(options: RecipeCronOptions) {
  return createCronSchedule(options.expression, options);
}

async function untilStopped(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  await new Promise<void>((resolve) =>
    signal.addEventListener("abort", () => resolve(), { once: true }),
  );
}

export function createRecipeWorker(
  options: RecipeWorkerOptions,
): RecipeService {
  return { start: (signal) => runQueueWorker({ ...options, signal }) };
}
export function createRecipeSchedules(
  options: RecipeScheduleOptions,
): RecipeService {
  return { start: (signal) => runSchedules({ ...options, signal }) };
}
export function createRecipeQueueServer(
  options: RecipeQueueServerOptions,
): RecipeService {
  return {
    async start(signal) {
      signal.throwIfAborted();
      const server = await serveTaskQueue(options);
      try {
        await untilStopped(signal);
      } finally {
        await server.close();
      }
    },
  };
}
export function createRecipeTriggerServer(
  options: RecipeTriggerServerOptions,
): RecipeService {
  return {
    async start(signal) {
      signal.throwIfAborted();
      const server = await serveTriggers(options);
      try {
        await untilStopped(signal);
      } finally {
        await server.close();
      }
    },
  };
}
export function createRecipeTriggerMapper(
  options: RecipeTriggerMapperOptions,
): RecipeTriggerMapper {
  if (!options.handler.trim())
    throw new Error("Trigger mapper requires a handler");
  return (event) => {
    if (options.kinds && !options.kinds.includes(event.kind)) return undefined;
    if (
      options.actions &&
      (!event.action || !options.actions.includes(event.action))
    )
      return undefined;
    return {
      handler: options.handler,
      runId: `${options.runIdPrefix ?? event.source}:${event.delivery}`,
      input: options.input === undefined ? event.payload : options.input,
    };
  };
}

export function createRecipeSchedule(
  options: RecipeScheduleDeclaration,
): TriggerSchedule {
  const input = options.input;
  return {
    name: options.name,
    cron: options.cron,
    handler: options.handler,
    ...(options.runId ? { runId: options.runId } : {}),
    input: typeof input === "function" ? input : () => input ?? null,
  };
}
