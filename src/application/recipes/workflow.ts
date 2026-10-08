import { validateRecipeWorkflowSettings } from "./workflow-validation.ts";
import { dispatchFields } from "./workflow.constants.ts";
import { defineTask, defineWorkflow } from "../../domain/workflow.ts";
import { defineLoopTask } from "../../domain/workflow/loop-task.ts";
import {
  defineAgentTask,
  defineCommandTask,
  defineIsolatedTask,
} from "../tasks.ts";
import { defineDecisionTask } from "../decision-task.ts";
import { resolveRecipeInputs } from "../../domain/recipe-inputs.ts";
import {
  recipeCondition,
  recipeExpression,
  recipeJson,
} from "../../domain/recipes/expressions.ts";
import { renderRecipeCommand } from "../../domain/recipe-templates.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type {
  Task,
  TaskContext,
  Workflow,
} from "../../domain/workflow.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { DecisionState } from "../../domain/decision.types.ts";
import type {
  RecipeExecutionBindings,
  RecipeWorkflowComponents,
} from "./workflow-components.types.ts";

export function recipeDispatchProjection(
  value: unknown,
): Readonly<Record<string, WorkflowJson>> {
  if (!recipeObject(value)) throw new Error("Expected a dispatch result");
  return Object.fromEntries(
    dispatchFields.flatMap((key) =>
      value[key] === undefined ? [] : [[key, recipeJson(value[key])]],
    ),
  );
}

export function recipeHasSharedSandbox(document: RecipeDocument): boolean {
  return document.tasks.some((step) => step.command || step.agent);
}

export function validateRecipeConcurrency(
  document: RecipeDocument,
  concurrency?: number,
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
      if (!ancestors.get(right.key)?.has(left.key))
        throw new Error(
          `Concurrent recipe tasks ${left.key} and ${right.key} share one sandbox; add dependency edges or use isolated tasks`,
        );
}

function decisionState(value: WorkflowJson): DecisionState {
  if (
    typeof value === "string" ||
    (value !== null && typeof value === "object")
  )
    return value;
  throw new Error("Recipe decision state requires a string, object or array");
}

export function bindRecipeWorkflow(
  document: RecipeDocument,
  bindings: RecipeExecutionBindings,
  components: RecipeWorkflowComponents = { workflow: {}, steps: {} },
): Workflow {
  validateRecipeWorkflowSettings(document, components);
  const inputs = resolveRecipeInputs(document.inputs, bindings.inputs);
  const tasks = new Map<string, Task>();
  const sandbox = () => {
    if (!bindings.sandbox)
      throw new Error("Recipe task requires a shared sandbox");
    return bindings.sandbox;
  };
  for (const step of document.tasks) {
    const configuration = components.steps[step.key] ?? {};
    const after = step.after.map((key) => {
      const task = tasks.get(key);
      if (!task) throw new Error(`Unknown recipe dependency: ${key}`);
      return task;
    });
    const contextFor = (context: TaskContext) => ({
      inputs,
      steps: document.tasks.map((task) => task.key),
      output(key: string) {
        const task = tasks.get(key);
        if (!task) throw new Error(`Unknown recipe dependency: ${key}`);
        return context.value(task);
      },
    });
    const evaluate = (value: unknown, context: TaskContext) =>
      recipeExpression(value, contextFor(context));
    const text = (value: string, context: TaskContext): string => {
      const result = evaluate(value, context);
      if (typeof result !== "string")
        throw new Error("Recipe text requires a string");
      return result;
    };
    const common = {
      key: step.key,
      after,
      ...(step.timeoutMs === undefined ? {} : { timeoutMs: step.timeoutMs }),
      ...(step.retry ? { retry: step.retry } : {}),
      ...configuration.options,
      ...(step.when === undefined
        ? {}
        : {
            condition: (context: TaskContext) =>
              recipeCondition(step.when, contextFor(context)),
          }),
    };
    const save = (task: Task) => tasks.set(step.key, task);
    if (step.loop) {
      if (!configuration.loop)
        throw new Error("Recipe loop components require createRecipeRuntime");
      const loop = configuration.loop;
      save(
        defineLoopTask({
          ...common,
          ...loop,
          attempt: async (context, feedback) => ({
            value: recipeJson(await loop.attempt(context, feedback)),
          }),
          check: (context, output) => loop.check(context, output.value),
        }),
      );
      continue;
    }
    if (step.decision) {
      if (!configuration.decision)
        throw new Error(
          "Recipe decision components require createRecipeRuntime",
        );
      const decision = defineDecisionTask({
        ...common,
        ...configuration.decision,
        state: (context) => decisionState(evaluate(step.state ?? {}, context)),
      });
      save(
        defineTask({
          ...decision,
          async perform(context) {
            return { value: recipeJson(await decision.perform(context)) };
          },
        }),
      );
      continue;
    }
    if (step.isolated) {
      if (!configuration.isolated)
        throw new Error(
          "Recipe isolated components require createRecipeRuntime",
        );
      const request = configuration.isolated;
      const isolated = defineIsolatedTask({
        ...common,
        request: (context) => ({
          ...request,
          brief:
            request.brief.text === undefined
              ? request.brief
              : { text: text(request.brief.text, context) },
        }),
      });
      save(
        defineTask({
          ...isolated,
          async perform(context) {
            return recipeDispatchProjection(await isolated.perform(context));
          },
        }),
      );
      continue;
    }
    if (Object.hasOwn(step, "value")) {
      save(
        defineTask({
          ...common,
          perform: (context) => ({ value: evaluate(step.value, context) }),
        }),
      );
      continue;
    }
    if (step.call) {
      if (!configuration.call)
        throw new Error("Recipe call components require createRecipeRuntime");
      const call = configuration.call;
      save(
        defineTask({
          ...common,
          async perform(context) {
            return {
              value: recipeJson(
                await call.perform(
                  evaluate(step.arguments ?? {}, context),
                  context,
                ),
              ),
            };
          },
        }),
      );
      continue;
    }
    if (step.command) {
      const command = step.command;
      save(
        defineTask({
          ...common,
          perform: (context) =>
            defineCommandTask({
              key: step.key,
              sandbox: sandbox(),
              command: renderRecipeCommand(command, (value) =>
                text(value, context),
              ),
            }).perform(context),
        }),
      );
      continue;
    }
    const agent = step.agent ? bindings.agents?.[step.agent] : undefined;
    if (!agent || step.brief === undefined)
      throw new Error(`Unknown recipe agent: ${step.agent}`);
    if (step.dispatch && !configuration.dispatch)
      throw new Error("Recipe dispatch components require createRecipeRuntime");
    const brief = step.brief;
    save(
      defineTask({
        ...common,
        async perform(context) {
          const task = defineAgentTask({
            key: step.key,
            sandbox: sandbox(),
            request: () => ({
              ...configuration.dispatch,
              agent,
              brief: { text: text(brief, context) },
            }),
          });
          return recipeDispatchProjection(await task.perform(context));
        },
      }),
    );
  }
  const workflow = defineWorkflow(document.name, [...tasks.values()]);
  return {
    ...workflow,
    start(options = {}) {
      const settings = {
        ...(recipeHasSharedSandbox(document) ? { concurrency: 1 } : {}),
        ...components.workflow,
        ...options,
      };
      validateRecipeConcurrency(document, settings.concurrency);
      return workflow.start(settings);
    },
  };
}
