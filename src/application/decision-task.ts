import { modelUsage } from "../domain/usage.ts";
import { defineTask } from "../domain/workflow.ts";
import {
  validateDecisionProvider,
  defineDecision,
  validateDecisionState,
} from "../domain/decision.ts";
import { invariant } from "../domain/errors.ts";
import type {
  DecisionQuestions,
  DecisionResult,
} from "../domain/decision.types.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { DecisionTaskOptions } from "./decision.types.ts";
import { executeDecision } from "./decision.ts";

export function defineDecisionTask<const Q extends DecisionQuestions>(
  options: DecisionTaskOptions<Q>,
): Task<DecisionResult<Q>> {
  const { provider, model, decision, state, allowTruncated, ...task } = options;
  validateDecisionProvider(provider);
  invariant(
    typeof model === "string" && model.trim(),
    "Decision model must be nonempty text",
  );
  invariant(
    decision?.kind === "decision",
    "Declare decisions with defineDecision",
  );
  const declared = defineDecision({ questions: decision.questions });
  invariant(
    allowTruncated === undefined || typeof allowTruncated === "boolean",
    "Decision allowTruncated must be boolean",
  );
  if (typeof state !== "function") validateDecisionState(state);
  return defineTask({
    ...task,
    async perform(context) {
      return executeDecision(
        {
          provider,
          model,
          decision: declared,
          state: typeof state === "function" ? await state(context) : state,
          signal: context.signal,
          ...(context.observation ? { observation: context.observation } : {}),
          ...(allowTruncated === undefined ? {} : { allowTruncated }),
        },
        {
          account: (usage) =>
            context.reportUsage(
              context.prices ? modelUsage(usage, model) : usage,
            ),
        },
      );
    },
  });
}
