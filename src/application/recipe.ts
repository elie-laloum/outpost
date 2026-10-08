import { bindRecipeWorkflow } from "./recipes/workflow.ts";
import { defineWorkflow } from "../domain/workflow.ts";
import type {
  Task,
  Workflow,
  WorkflowOptions,
  TaskContext,
} from "../domain/workflow.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import { defineAgentTask, defineCommandTask } from "./tasks.ts";
import type { RecipeBindings } from "./recipe.types.ts";
import type { RecipeDispatchSettings } from "./recipes/agent-components.types.ts";
import { resolveRecipeInputs, recipeValue } from "../domain/recipe-inputs.ts";
import {
  renderRecipeText,
  renderRecipeCommand,
} from "../domain/recipe-templates.ts";

export function defineRecipe(
  source: string,
  bindings: RecipeBindings,
): Workflow {
  return bindRecipe(parseRecipe(source), bindings);
}

export function bindRecipe(
  document: RecipeDocument,
  bindings: RecipeBindings,
  requests: Readonly<Record<string, RecipeDispatchSettings>> = {},
): Workflow {
  if (document.version === 3)
    return bindRecipeWorkflow(document, bindings, {
      workflow: {},
      steps: Object.fromEntries(
        Object.entries(requests).map(([key, dispatch]) => [key, { dispatch }]),
      ),
    });
  const inputs = resolveRecipeInputs(document.inputs, bindings.inputs);
  const tasks = new Map<string, Task>();
  for (const step of document.tasks) {
    const { command, agent: name, brief, after, dispatch: settings } = step;
    const common = {
      key: step.key,
      ...(step.timeoutMs === undefined ? {} : { timeoutMs: step.timeoutMs }),
      ...(step.retry ? { retry: step.retry } : {}),
    };
    if (settings && !requests[step.key])
      throw new Error("Recipe dispatch components require createRecipeRuntime");
    const render = (text: string, context: TaskContext) => {
      if (document.version === 1) return text;
      return renderRecipeText(text, (reference) => {
        if (reference.kind === "inputs") return inputs[reference.key]!;
        const value: unknown = context.value(tasks.get(reference.key)!);
        const field =
          value && typeof value === "object"
            ? new Map(Object.entries(value)).get(reference.field!)
            : undefined;
        if (!recipeValue(field))
          throw new Error(
            `Missing recipe output: ${reference.key}.${reference.field}`,
          );
        return field;
      });
    };
    const dependencies = after.map((key) => {
      const dependency = tasks.get(key);
      if (!dependency) throw new Error(`Unknown recipe dependency: ${key}`);
      return dependency;
    });
    if (command) {
      tasks.set(
        step.key,
        defineCommandTask({
          ...common,
          after: dependencies,
          sandbox: bindings.sandbox,
          command: (context) =>
            renderRecipeCommand(command, (text) => render(text, context)),
        }),
      );
      continue;
    }
    const agent =
      name && Object.hasOwn(bindings.agents ?? {}, name)
        ? bindings.agents?.[name]
        : undefined;
    if (!agent || brief === undefined)
      throw new Error(`Unknown recipe agent: ${name}`);
    tasks.set(
      step.key,
      defineAgentTask({
        ...common,
        after: dependencies,
        sandbox: bindings.sandbox,
        request: (context) => ({
          ...requests[step.key],
          agent,
          brief: { text: render(brief, context) },
        }),
      }),
    );
  }
  const workflow = defineWorkflow(document.name, [...tasks.values()]);
  return Object.freeze({
    ...workflow,
    start(options: WorkflowOptions = {}) {
      if (options.concurrency !== undefined && options.concurrency !== 1)
        throw new Error(
          "A recipe shares one sandbox and requires concurrency 1",
        );
      return workflow.start({ ...options, concurrency: 1 });
    },
  });
}
