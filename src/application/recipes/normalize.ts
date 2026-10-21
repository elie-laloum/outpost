import { recipeAction } from "../../domain/recipes/actions.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import type {
  NormalizedRecipe,
  NormalizedRecipeStep,
} from "./normalized.types.ts";
import type {
  RecipeWorkflowComponents,
  RecipeWorkflowStepComponents,
} from "./workflow-components.types.ts";

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

export function normalizeRecipe(
  document: RecipeDocument,
  components: RecipeWorkflowComponents,
): NormalizedRecipe {
  return {
    version: document.version,
    name: document.name,
    inputs: document.inputs,
    tasks: document.tasks.map((step, index) =>
      normalizeStep(step, components.steps[step.key] ?? {}, index),
    ),
  };
}

function normalizeStep(
  step: RecipeStep,
  configuration: RecipeWorkflowStepComponents,
  index: number,
): NormalizedRecipeStep {
  const kind = recipeAction(step, `tasks[${index}]`);
  const common = {
    key: step.key,
    after: step.after,
    ...(step.timeoutMs === undefined ? {} : { timeoutMs: step.timeoutMs }),
    ...(step.retry ? { retry: step.retry } : {}),
    ...(step.when === undefined ? {} : { when: step.when }),
    ...(configuration.options ? { options: configuration.options } : {}),
  };
  const quota = step.quotaResume ? { quotaResume: step.quotaResume } : {};
  const arguments_ =
    step.arguments === undefined ? {} : { arguments: step.arguments };
  switch (kind) {
    case "command":
      return {
        ...common,
        kind,
        command: required(step.command, `${step.key}: command is required`),
      };
    case "agent":
      if (step.dispatch && !configuration.dispatch)
        throw new Error(
          "Recipe dispatch components require createRecipeRuntime",
        );
      return {
        ...common,
        kind,
        ...quota,
        agent: required(step.agent, `${step.key}: agent is required`),
        brief: required(step.brief, `${step.key}: brief is required`),
        ...(configuration.dispatch ? { dispatch: configuration.dispatch } : {}),
      };
    case "value":
      return {
        ...common,
        kind,
        value: required(step.value, `${step.key}: value is required`),
      };
    case "call":
      return {
        ...common,
        kind,
        ...arguments_,
        call: required(
          configuration.call,
          "Recipe call components require createRecipeRuntime",
        ),
      };
    case "loop":
      return {
        ...common,
        kind,
        loop: required(
          configuration.loop,
          "Recipe loop components require createRecipeRuntime",
        ),
      };
    case "decision":
      return {
        ...common,
        kind,
        decision: required(
          configuration.decision,
          "Recipe decision components require createRecipeRuntime",
        ),
        ...(step.state === undefined ? {} : { state: step.state }),
      };
    case "isolated":
      return {
        ...common,
        kind,
        ...quota,
        isolated: required(
          configuration.isolated,
          "Recipe isolated components require createRecipeRuntime",
        ),
      };
    case "gate":
      return {
        ...common,
        kind,
        gate: required(
          configuration.gate,
          "Recipe gates require createRecipeRuntime",
        ),
      };
    case "interactive":
      return {
        ...common,
        kind,
        interactive: required(
          configuration.interactive,
          "Recipe dialogues require createRecipeRuntime",
        ),
      };
    case "artifact":
      return {
        ...common,
        kind,
        artifact: required(
          configuration.artifact,
          "Recipe artifacts require createRecipeRuntime",
        ),
        ...(step.data === undefined ? {} : { data: step.data }),
      };
    case "queued":
      return {
        ...common,
        kind,
        ...arguments_,
        queued: required(
          configuration.queued,
          "Recipe queued tasks require createRecipeRuntime",
        ),
      };
    case "speculation":
      return {
        ...common,
        kind,
        speculation: required(
          configuration.speculation,
          "Recipe speculation requires createRecipeRuntime",
        ),
      };
    default:
      return unreachableRecipeStep(kind);
  }
}

export function unreachableRecipeStep(value: never): never {
  throw new Error(`Unsupported recipe task action: ${String(value)}`);
}
