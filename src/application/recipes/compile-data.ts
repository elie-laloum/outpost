import { defineTask } from "../../domain/workflow.ts";
import { defineLoopTask } from "../../domain/workflow/loop-task.ts";
import { defineDecisionTask } from "../decision-task.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { DecisionState } from "../../domain/decision.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeStepOf } from "./normalized.types.ts";
import type { Task } from "../../domain/workflow.types.ts";

export function compileValue(
  step: RecipeStepOf<"value">,
  context: RecipeCompilationContext,
): Task {
  const { common, evaluate } = context;
  return defineTask({
    ...common,
    perform: (context) => ({ value: evaluate(step.value, context) }),
  });
}

export function compileCall(
  step: RecipeStepOf<"call">,
  context: RecipeCompilationContext,
): Task {
  const { common, evaluate } = context;
  const call = step.call;
  return defineTask({
    ...common,
    async perform(context) {
      return {
        value: recipeJson(
          await call.perform(evaluate(step.arguments ?? {}, context), context),
        ),
      };
    },
  });
}

export function compileLoop(
  step: RecipeStepOf<"loop">,
  context: RecipeCompilationContext,
): Task {
  const { common } = context;
  const loop = step.loop;
  return defineLoopTask({
    ...common,
    ...loop,
    attempt: async (context, feedback) => ({
      value: recipeJson(await loop.attempt(context, feedback)),
    }),
    check: (context, output) => loop.check(context, output.value),
  });
}

export function compileDecision(
  step: RecipeStepOf<"decision">,
  context: RecipeCompilationContext,
): Task {
  const { common, evaluate } = context;
  const decision = defineDecisionTask({
    ...common,
    ...step.decision,
    state: (context) => decisionState(evaluate(step.state ?? {}, context)),
  });
  return defineTask({
    ...decision,
    async perform(context) {
      return { value: recipeJson(await decision.perform(context)) };
    },
  });
}

function decisionState(value: WorkflowJson): DecisionState {
  if (
    typeof value === "string" ||
    (value !== null && typeof value === "object")
  )
    return value;
  throw new Error("Recipe decision state requires a string, object or array");
}
