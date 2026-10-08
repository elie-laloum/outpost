import { nativeRecipeGuards } from "./native.ts";
import { createRecipeComponentScope } from "./scope.ts";
import { resolveRecipeInputs } from "../../domain/recipe-inputs.ts";
import { triggerQueueRequest } from "../../domain/trigger-job.ts";
import { queueRequest } from "../../domain/task-queue.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import type { RecipeProject } from "./project.types.ts";
import type {
  RecipeEnqueueOptions,
  RecipeServeOptions,
  RecipeService,
} from "./service-components.types.ts";
import type { TaskQueue } from "../../domain/task-queue.types.ts";

function service(value: unknown): value is RecipeService {
  return nativeRecipeGuards.service!(value);
}
function queue(value: unknown): value is TaskQueue {
  return nativeRecipeGuards.queue!(value);
}

export async function serveRecipeProject(
  project: RecipeProject,
  settings: RecipeServeOptions,
  signal: AbortSignal,
): Promise<void> {
  const name = settings.service.startsWith("services.")
    ? settings.service
    : `services.${settings.service}`;
  if (project.graph.nodes.get(name)?.kind !== "service")
    throw new Error(`Unknown recipe service: ${settings.service}`);
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    project.directory,
    signal,
  );
  try {
    const selected = await scope.resolve(name, "service");
    if (!service(selected)) throw new Error(`Invalid recipe service: ${name}`);
    signal.throwIfAborted();
    await selected.start(signal);
  } finally {
    await scope.close();
  }
}

export async function enqueueRecipeProject(
  project: RecipeProject,
  settings: RecipeEnqueueOptions,
  signal: AbortSignal,
) {
  const name = settings.queue.startsWith("queues.")
    ? settings.queue
    : `queues.${settings.queue}`;
  if (project.graph.nodes.get(name)?.kind !== "queue")
    throw new Error(`Unknown recipe queue: ${settings.queue}`);
  const inputs = resolveRecipeInputs(project.document.inputs, settings.inputs);
  for (const [name, definition] of Object.entries(project.document.inputs))
    if (definition.schema)
      validateRecipeSchema(definition.schema, inputs[name], `inputs.${name}`);
  const request = queueRequest({
    ...triggerQueueRequest(
      settings.id ?? `recipe:${settings.handler}:${settings.runId}`,
      { handler: settings.handler, runId: settings.runId, input: inputs },
    ),
    ...(settings.idempotencyKey
      ? { idempotencyKey: settings.idempotencyKey }
      : {}),
    ...(settings.deadline === undefined ? {} : { deadline: settings.deadline }),
  });
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    project.directory,
    signal,
  );
  try {
    const selected = await scope.resolve(name, "queue");
    if (!queue(selected)) throw new Error(`Invalid recipe queue: ${name}`);
    signal.throwIfAborted();
    return scope.redact(await selected.enqueue(request));
  } finally {
    await scope.close();
  }
}
