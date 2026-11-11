import { recipeAction } from "../../domain/recipes/actions.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import {
  declarativeRecipeLoop,
  recipeLoopDispatchComponent,
  recipeLoopDone,
} from "../../domain/recipes/loop.ts";
import type {
  RecipeDeclarativeLoop,
  RecipeLoopAgentStep,
} from "../../domain/recipes/loop.types.ts";
import type {
  NormalizedRecipe,
  NormalizedRecipeLoop,
  NormalizedRecipeLoopAttemptAgent,
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
      normalizeStep(document, step, components.steps[step.key] ?? {}, index),
    ),
  };
}

function normalizeStep(
  document: RecipeDocument,
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
    case "loop": {
      const loop = declarativeRecipeLoop(step);
      if (loop)
        return {
          ...common,
          kind: "declarative-loop",
          ...quota,
          loop: normalizeDeclarativeLoop(
            document,
            step,
            index,
            loop,
            configuration,
          ),
        };
      return {
        ...common,
        kind,
        loop: required(
          configuration.loop,
          "Recipe loop components require createRecipeRuntime",
        ),
      };
    }
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

function normalizeDeclarativeLoop(
  document: RecipeDocument,
  step: RecipeStep,
  index: number,
  loop: RecipeDeclarativeLoop,
  configuration: RecipeWorkflowStepComponents,
): NormalizedRecipeLoop {
  const dispatch = (
    agent: RecipeLoopAgentStep,
  ): Pick<NormalizedRecipeLoopAttemptAgent, "dispatch"> => {
    if (!agent.dispatch) return {};
    const settings =
      configuration.loopDispatch?.[
        recipeLoopDispatchComponent(step.key, agent)
      ];
    if (!settings)
      throw new Error("Recipe dispatch components require createRecipeRuntime");
    return { dispatch: settings };
  };
  return {
    maxRounds: loop.maxRounds,
    attempt: loop.attempt.map((item) =>
      item.kind === "agent" ? { ...item, ...dispatch(item) } : item,
    ),
    check: loop.check.map((item) => {
      if (item.kind === "command") return item;
      const { done: _source, ...agent } = item;
      const done = recipeLoopDone(document, step, item, [
        "tasks",
        index,
        "loop",
      ]);
      return { ...agent, ...dispatch(item), ...(done ? { done } : {}) };
    }),
  };
}

export function unreachableRecipeStep(value: never): never {
  throw new Error(`Unsupported recipe task action: ${String(value)}`);
}
