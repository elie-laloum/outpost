import { configurationError } from "../../domain/configuration-diagnostic.ts";
import { defineWorkflow } from "../../domain/workflow.ts";
import { resolveRecipeInputs } from "../../domain/recipe-inputs.ts";
import {
  compileRecipeCondition,
  evaluateRecipeCondition,
  createRecipeExpressionEvaluator,
} from "../../domain/recipes/expressions.ts";
import { validateRecipeWorkflowSettings } from "./workflow-validation.ts";
import { normalizeRecipe } from "./normalize.ts";
import { compileRecipeStep } from "./compile-step.ts";
import { recipeTextRenderer } from "./rendering.ts";
import { recipeTaskWorkspace } from "./zones.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import type {
  Task,
  TaskContext,
  Workflow,
  WorkflowOptions,
} from "../../domain/workflow.types.ts";
import type {
  RecipeExecutionBindings,
  RecipeWorkflowComponents,
} from "./workflow-components.types.ts";

export function recipeHasSharedSandbox(document: RecipeDocument): boolean {
  return document.tasks.some((step) => step.command || step.agent);
}

/** `workspaceOf` groups shared tasks; only tasks of one workspace must be ordered. */
export function validateRecipeConcurrency(
  document: RecipeDocument,
  concurrency?: number,
  workspaceOf: (step: RecipeStep) => string = () => "workspace",
): void {
  if (concurrency === undefined || concurrency === 1) return;
  const ancestors = new Map<string, Set<string>>();
  for (const step of document.tasks)
    ancestors.set(
      step.key,
      new Set(
        step.after.flatMap((key) => [key, ...(ancestors.get(key) ?? [])]),
      ),
    );
  const shared = document.tasks.filter((step) => step.command || step.agent);
  for (const [index, left] of shared.entries())
    for (const right of shared.slice(index + 1))
      if (
        workspaceOf(left) === workspaceOf(right) &&
        !ancestors.get(right.key)?.has(left.key)
      )
        throw configurationError(
          `Concurrent recipe tasks ${left.key} and ${right.key} share one workspace; add dependency edges or use isolated tasks`,
          ["workflow", "concurrency"],
          "invalid-value",
          "Order the tasks of each workspace with after, isolate them, or set concurrency: 1.",
        );
}

export function bindRecipeWorkflow(
  document: RecipeDocument,
  bindings: RecipeExecutionBindings,
  components: RecipeWorkflowComponents = { workflow: {}, steps: {} },
): Workflow {
  if (document.version === 3)
    validateRecipeWorkflowSettings(document, components);
  const inputs = resolveRecipeInputs(document.inputs, bindings.inputs);
  const program = normalizeRecipe(document, components);
  const tasks = new Map<string, Task>();
  const sandbox = async (context: TaskContext, name?: string) => {
    if (bindings.acquireSandbox) return bindings.acquireSandbox(context, name);
    if (name !== undefined)
      throw new Error(`Recipe task requires sandbox ${name}`);
    if (!bindings.sandbox)
      throw new Error("Recipe task requires a shared sandbox");
    return bindings.sandbox;
  };
  const named = new Map(
    document.tasks.map((step) => [step.key, step.sandbox] as const),
  );
  const keys = program.tasks.map((step) => step.key);
  const contextFor = (context: TaskContext) => ({
    inputs,
    steps: keys,
    output(key: string) {
      const task = tasks.get(key);
      if (!task) throw new Error(`Unknown recipe dependency: ${key}`);
      return context.value(task);
    },
  });
  const expression = createRecipeExpressionEvaluator(Object.keys(inputs), keys);
  const evaluate = (value: unknown, context: TaskContext) =>
    expression(value, contextFor(context));
  const text = recipeTextRenderer(program.version, contextFor, evaluate);
  for (const step of program.tasks) {
    const after = step.after.map((key) => {
      const task = tasks.get(key);
      if (!task) throw new Error(`Unknown recipe dependency: ${key}`);
      return task;
    });
    const condition =
      step.when === undefined
        ? undefined
        : compileRecipeCondition(step.when, {
            inputs: Object.keys(inputs),
            steps: keys,
          });
    const common = {
      key: step.key,
      after,
      ...(step.timeoutMs === undefined ? {} : { timeoutMs: step.timeoutMs }),
      ...(step.retry ? { retry: step.retry } : {}),
      ...step.options,
      ...(condition === undefined
        ? {}
        : {
            condition: (context: TaskContext) =>
              evaluateRecipeCondition(condition, contextFor(context)),
          }),
    };
    const selected = named.get(step.key);
    tasks.set(
      step.key,
      compileRecipeStep(step, {
        version: program.version,
        common,
        bindings,
        components,
        sandbox: (context) => sandbox(context, selected),
        ...(selected === undefined ? {} : { sandboxName: selected }),
        evaluate,
        text,
      }),
    );
  }
  const workflow = defineWorkflow(program.name, [...tasks.values()]);
  const result: Workflow = {
    ...workflow,
    start(options: WorkflowOptions = {}) {
      if (program.version !== 3) {
        if (options.concurrency !== undefined && options.concurrency !== 1)
          throw new Error(
            "A recipe shares one sandbox and requires concurrency 1",
          );
        return workflow.start({ ...options, concurrency: 1 });
      }
      const settings = {
        ...(recipeHasSharedSandbox(document) ? { concurrency: 1 } : {}),
        ...components.workflow,
        ...options,
      };
      validateRecipeConcurrency(
        document,
        settings.concurrency,
        recipeTaskWorkspace(components.sandboxes ?? {}),
      );
      return workflow.start(settings);
    },
  };
  return program.version === 3 ? result : Object.freeze(result);
}
