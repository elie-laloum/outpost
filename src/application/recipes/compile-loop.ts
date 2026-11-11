import { defineLoopTask } from "../../domain/workflow/loop-task.ts";
import { configurationError } from "../../domain/configuration-diagnostic.ts";
import { validateRecipeLoopResponse } from "../../domain/recipes/loop.ts";
import { compileLoopAttempt } from "./compile-loop-attempt.ts";
import { compileLoopCheck } from "./compile-loop-check.ts";
import {
  loopAgent,
  repairsResponses,
  resumesConversation,
} from "./compile-loop-steps.ts";
import type { Task } from "../../domain/workflow.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type {
  NormalizedRecipeLoopAttemptAgent,
  NormalizedRecipeLoopCheckAgent,
  RecipeStepOf,
} from "./normalized.types.ts";
import type { RecipeLoopOutput } from "./compile-loop.types.ts";

/** Refuses, before the first round, what an agent cannot do or a check response cannot decide. */
function validateLoopAgents(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): void {
  const loopPath = ["tasks", step.key, "loop"];
  const agents = [...step.loop.attempt, ...step.loop.check].filter(
    (
      item,
    ): item is
      NormalizedRecipeLoopAttemptAgent | NormalizedRecipeLoopCheckAgent =>
      item.kind === "agent",
  );
  for (const item of agents) {
    const at = [...loopPath, ...item.path];
    const agent = loopAgent(context, item.agent);
    if (
      "conversation" in item &&
      item.conversation === "continue" &&
      !resumesConversation(agent)
    )
      throw configurationError(
        `${step.key}: agent ${item.agent} cannot continue its conversation between rounds`,
        [...at, "conversation"],
        "unsupported-capability",
        "Set conversation: new, or choose an agent that resumes conversations.",
      );
    if ((item.dispatch?.response?.repairs ?? 0) > 0 && !repairsResponses(agent))
      throw configurationError(
        `${step.key}: agent ${item.agent} cannot resume a conversation to repair its response`,
        [...at, "dispatch", "response", "repairs"],
        "unsupported-capability",
        "Set repairs: 0 on the response, or choose an agent that resumes conversations.",
      );
  }
  for (const item of step.loop.check)
    if (item.kind === "agent")
      validateRecipeLoopResponse(item, item.dispatch?.response, loopPath);
}

/** Compiles ordered attempt and check steps into a loop task in the shared workspace. */
export function compileDeclarativeLoop(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): Task {
  validateLoopAgents(step, context);
  return defineLoopTask<RecipeLoopOutput>({
    ...context.common,
    maxRounds: step.loop.maxRounds,
    attempt: compileLoopAttempt(step, context),
    check: compileLoopCheck(step, context),
  });
}
