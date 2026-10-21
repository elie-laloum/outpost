import { defineTask } from "../../domain/workflow.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { renderRecipeCommand } from "../../domain/recipe-templates.ts";
import {
  defineAgentTask,
  defineCommandTask,
  defineIsolatedTask,
  defineIsolatedCommandTask,
} from "../tasks.ts";
import { recipeDispatchProjection } from "./projection.ts";
import type { Task } from "../../domain/workflow.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeStepOf } from "./normalized.types.ts";

export function compileCommand(
  step: RecipeStepOf<"command">,
  context: RecipeCompilationContext,
): Task {
  const { common, bindings, sandbox, text } = context;
  if (context.version !== 3) {
    if (!bindings.sandbox)
      throw new Error("Recipe task requires a shared sandbox");
    return defineCommandTask({
      ...common,
      sandbox: bindings.sandbox,
      command: (context) =>
        renderRecipeCommand(step.command, (value) => text(value, context)),
    });
  }
  return defineTask({
    ...common,
    perform: async (context) =>
      defineCommandTask({
        key: step.key,
        sandbox: await sandbox(context),
        command: renderRecipeCommand(step.command, (value) =>
          text(value, context),
        ),
      }).perform(context),
  });
}

export function compileAgent(
  step: RecipeStepOf<"agent">,
  context: RecipeCompilationContext,
): Task {
  const { common, bindings, sandbox, text } = context;
  const agent =
    bindings.agents && Object.hasOwn(bindings.agents, step.agent)
      ? bindings.agents[step.agent]
      : undefined;
  if (!agent) throw new Error(`Unknown recipe agent: ${step.agent}`);
  if (context.version !== 3) {
    if (!bindings.sandbox)
      throw new Error("Recipe task requires a shared sandbox");
    return defineAgentTask({
      ...common,
      sandbox: bindings.sandbox,
      request: (context) => ({
        ...step.dispatch,
        agent,
        brief: { text: text(step.brief, context) },
      }),
    });
  }
  return defineTask({
    ...common,
    async perform(context) {
      const request = {
        ...step.dispatch,
        agent,
        brief: { text: text(step.brief, context) },
      };
      await bindings.validateDispatch?.(request);
      const task = defineAgentTask({
        ...(step.quotaResume ? { quotaResume: step.quotaResume } : {}),
        key: step.key,
        sandbox: await sandbox(context),
        request: () => request,
      });
      return recipeDispatchProjection(await task.perform(context));
    },
  });
}

export function compileIsolated(
  step: RecipeStepOf<"isolated">,
  context: RecipeCompilationContext,
): Task {
  const { common, bindings, text } = context;
  const request = step.isolated;
  if ("command" in request) {
    const isolated = defineIsolatedCommandTask({
      ...common,
      request: (context) => ({
        ...request,
        command: renderRecipeCommand(request.command, (value) =>
          text(value, context),
        ),
      }),
    });
    return defineTask({
      ...isolated,
      async perform(context) {
        return { value: recipeJson(await isolated.perform(context)) };
      },
    });
  }
  const isolated = defineIsolatedTask({
    ...common,
    ...(step.quotaResume ? { quotaResume: step.quotaResume } : {}),
    request: async (context) => {
      const rendered = {
        ...request,
        brief:
          request.brief.text === undefined
            ? request.brief
            : { text: text(request.brief.text, context) },
      };
      const prepared = bindings.prepareIsolated
        ? await bindings.prepareIsolated(step.key, rendered, context)
        : rendered;
      if ("command" in prepared)
        throw new Error(
          "An isolated agent declaration cannot become a command",
        );
      return prepared;
    },
  });
  return defineTask({
    ...isolated,
    async perform(context) {
      try {
        return recipeDispatchProjection(await isolated.perform(context));
      } finally {
        await bindings.releaseIsolated?.(step.key);
      }
    },
  });
}
