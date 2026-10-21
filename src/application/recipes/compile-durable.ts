import { defineQueuedTask } from "../queued-task.ts";
import { defineInteractiveAgentTask } from "../interactive-task.ts";
import {
  defineApprovalTask,
  definePauseTask,
} from "../../domain/workflow/gates.ts";
import { defineArtifactTask } from "../artifact-tasks.ts";
import { defineTask } from "../../domain/workflow.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { runRecipeSpeculation } from "./speculation.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeStepOf } from "./normalized.types.ts";
import type { Task } from "../../domain/workflow.types.ts";

export function compileSpeculation(
  step: RecipeStepOf<"speculation">,
  context: RecipeCompilationContext,
): Task {
  const { common, text, components } = context;
  const options = step.speculation;
  return defineTask({
    ...common,
    async perform(context) {
      const candidates = options.candidates.map((candidate) => ({
        ...candidate,
        request: {
          ...candidate.request,
          brief:
            candidate.request.brief.text === undefined
              ? candidate.request.brief
              : { text: text(candidate.request.brief.text, context) },
        },
      }));
      const durability = options.durability
        ? {
            ...options.durability,
            runId: JSON.stringify([
              components.workflow.checkpoint?.runId,
              step.key,
              options.durability.runId,
            ]),
            version: `${options.durability.version}#recipe:${components.identity}`,
            ...(components.retryIncomplete
              ? { resume: "retry-incomplete" as const }
              : {}),
          }
        : undefined;
      return {
        value: await runRecipeSpeculation(
          {
            ...options,
            candidates,
            ...(durability ? { durability } : {}),
          },
          context,
        ),
      };
    },
  });
}

export function compileQueued(
  step: RecipeStepOf<"queued">,
  context: RecipeCompilationContext,
): Task {
  const { common, evaluate } = context;
  const options = step.queued;
  if (options.input && Object.hasOwn(step, "arguments"))
    throw new Error(`${step.key}: provide either arguments or queued.input`);
  const queued = defineQueuedTask({
    ...common,
    ...options,
    input:
      options.input ?? ((context) => evaluate(step.arguments ?? {}, context)),
    decode: options.decode ?? recipeJson,
  });
  return defineTask({
    ...queued,
    async perform(context) {
      return { value: recipeJson(await queued.perform(context)) };
    },
  });
}

export function compileGate(
  step: RecipeStepOf<"gate">,
  context: RecipeCompilationContext,
): Task {
  const { common } = context;
  const { kind, ...gate } = step.gate;
  const factories = {
    approval: defineApprovalTask,
    pause: definePauseTask,
  };
  return defineTask({
    ...factories[kind]({ key: step.key, after: common.after, ...gate }),
    ...common,
  });
}

export function compileInteractive(
  step: RecipeStepOf<"interactive">,
  context: RecipeCompilationContext,
): Task {
  const { common } = context;
  const interactive =
    "workspaceSource" in step.interactive
      ? defineInteractiveAgentTask({
          ...common,
          ...step.interactive,
        })
      : defineInteractiveAgentTask({
          ...common,
          ...step.interactive,
        });
  return defineTask({
    ...interactive,
    ...common,
    async perform(context) {
      return { value: recipeJson(await interactive.perform(context)) };
    },
  });
}

export function compileArtifact(
  step: RecipeStepOf<"artifact">,
  context: RecipeCompilationContext,
): Task {
  const { common, evaluate } = context;
  const artifact = step.artifact;
  if ((artifact.produce !== undefined) === Object.hasOwn(step, "data"))
    throw new Error(`${step.key}: provide either data or artifact.produce`);
  return defineArtifactTask({
    ...common,
    ...artifact,
    produce: artifact.produce ?? ((context) => evaluate(step.data, context)),
  });
}
