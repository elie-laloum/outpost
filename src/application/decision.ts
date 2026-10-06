import { OutpostError, invariant } from "../domain/errors.ts";
import {
  defineDecision,
  validateDecisionState,
  validateDecisionProvider,
} from "../domain/decision.ts";
import {
  decisionAnswers,
  decisionUsage,
  requireDecisionResponse,
} from "../domain/decision-result.ts";
import type {
  DecideOptions,
  DecisionQuestions,
  DecisionResult,
} from "../domain/decision.types.ts";
import type { DecisionAccounting } from "./decision.types.ts";
import type { Usage } from "../domain/agent.types.ts";

export function decide<const Q extends DecisionQuestions>(
  options: DecideOptions<Q>,
): Promise<DecisionResult<Q>> {
  return executeDecision(options);
}

export async function executeDecision<Q extends DecisionQuestions>(
  options: DecideOptions<Q>,
  accounting?: DecisionAccounting,
): Promise<DecisionResult<Q>> {
  invariant(
    options && typeof options === "object",
    "Decision options must be an object",
  );
  validateDecisionProvider(options.provider);
  invariant(
    typeof options.model === "string" && options.model.trim(),
    "Decision model must be nonempty text",
  );
  invariant(
    options.decision?.kind === "decision",
    "Declare decisions with defineDecision",
  );
  const decision = defineDecision({ questions: options.decision.questions });
  invariant(
    options.allowTruncated === undefined ||
      typeof options.allowTruncated === "boolean",
    "Decision allowTruncated must be boolean",
  );
  validateDecisionState(options.state);
  options.signal?.throwIfAborted();
  const start = Date.now();
  const emit = options.observation;
  const summary = {
    kind: "decision" as const,
    provider: options.provider.name,
    model: options.model,
  };
  emit?.emit("decision", { ...summary, status: "started" });
  if (emit?.verbose)
    emit.emit("decision", {
      kind: "decision-request",
      request: {
        model: options.model,
        state: options.state,
        questions: decision.questions,
      },
    });
  let usage: Usage | undefined;
  let truncated: boolean | undefined;
  try {
    const response = await options.provider.request({
      model: options.model,
      questions: decision.questions,
      state: options.state,
      ...(options.signal ? { signal: options.signal } : {}),
    });
    requireDecisionResponse(response !== null && typeof response === "object");
    usage = decisionUsage(response.usage);
    if (typeof response.truncated === "boolean") truncated = response.truncated;
    accounting?.account(usage);
    options.signal?.throwIfAborted();
    const answers = decisionAnswers(decision.questions, response);
    if (response.truncated && !options.allowTruncated)
      throw new OutpostError("response", "Decision input was truncated", {
        truncated: true,
      });
    const result: DecisionResult<Q> = {
      provider: options.provider.name,
      model: response.model,
      answers,
      usage,
      ...(response.truncated === undefined
        ? {}
        : { truncated: response.truncated }),
      ...(response.metadata === undefined
        ? {}
        : { metadata: response.metadata }),
    };
    emit?.emit("decision", {
      ...summary,
      model: result.model,
      status: "finished",
      usage,
      durationMs: Date.now() - start,
      ...(result.truncated === undefined
        ? {}
        : { truncated: result.truncated }),
    });
    if (emit?.verbose)
      emit.emit("decision", { kind: "decision-response", response: result });
    return result;
  } catch (error) {
    if (usage === undefined) {
      usage = decisionUsage(undefined);
      try {
        accounting?.account(usage);
      } catch {
        // Failed-request accounting must preserve the original provider fault.
      }
    }
    emit?.emit("decision", {
      ...summary,
      status: "failed",
      durationMs: Date.now() - start,
      usage,
      ...(truncated === undefined ? {} : { truncated }),
      ...(error instanceof OutpostError ? { code: error.code } : {}),
    });
    throw error;
  }
}
