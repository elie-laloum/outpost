import { OutpostError } from "./errors.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";
import {
  DECISION_PROBABILITY_TOLERANCE,
  DECISION_ROUNDING_ERROR,
  INCOMPLETE_DECISION_USAGE,
} from "./decision.constants.ts";
import type { Usage } from "./agent.types.ts";
import type {
  DecisionAnswers,
  DecisionProviderResult,
  DecisionQuestions,
} from "./decision.types.ts";

export function requireDecisionResponse(condition: unknown): asserts condition {
  if (!condition)
    throw new OutpostError("response", "Invalid decision response");
}

export function decisionObject(value: unknown): Record<string, unknown> {
  requireDecisionResponse(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const prototype: unknown = Object.getPrototypeOf(value);
  requireDecisionResponse(prototype === null || prototype === Object.prototype);
  requireDecisionResponse(
    Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return (
        typeof key === "string" &&
        descriptor?.enumerable &&
        "value" in descriptor
      );
    }),
  );
  return value as Record<string, unknown>;
}

export function decisionUsage(usage: Usage | undefined): Usage {
  if (usage === undefined) return INCOMPLETE_DECISION_USAGE;
  requireDecisionResponse(usage !== null && typeof usage === "object");
  requireDecisionResponse(
    [usage.input, usage.cached, usage.output, usage.cacheCreated ?? 0].every(
      (value) =>
        Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0),
    ),
  );
  requireDecisionResponse(
    usage.complete === undefined || typeof usage.complete === "boolean",
  );
  requireDecisionResponse(
    usage.cached + (usage.cacheCreated ?? 0) <= usage.input,
  );
  return {
    input: usage.input,
    cached: usage.cached,
    output: usage.output,
    ...(usage.complete === undefined ? {} : { complete: usage.complete }),
    ...(usage.cacheCreated === undefined
      ? {}
      : { cacheCreated: usage.cacheCreated }),
  };
}

function probability(value: unknown): number {
  requireDecisionResponse(
    typeof value === "number" &&
      Number.isFinite(value) &&
      !Object.is(value, -0) &&
      value >= 0 &&
      value <= 1,
  );
  return value;
}

function distribution(
  value: unknown,
  labels: readonly string[],
  sparse = false,
): Readonly<Record<string, number>> {
  const map = decisionObject(value);
  const keys = Object.keys(map);
  requireDecisionResponse(
    keys.length > 0 &&
      keys.every((key) => labels.includes(key)) &&
      (sparse || keys.length === labels.length),
  );
  const entries = Object.entries(map).map(
    ([key, value]) => [key, probability(value)] as const,
  );
  requireDecisionResponse(
    Math.abs(entries.reduce((sum, [, value]) => sum + value, 0) - 1) <=
      DECISION_PROBABILITY_TOLERANCE + entries.length * DECISION_ROUNDING_ERROR,
  );
  return Object.fromEntries(entries);
}

export function decisionAnswers<Q extends DecisionQuestions>(
  questions: Q,
  result: DecisionProviderResult,
): DecisionAnswers<Q> {
  requireDecisionResponse(
    typeof result.model === "string" && result.model.trim(),
  );
  requireDecisionResponse(
    result.truncated === undefined || typeof result.truncated === "boolean",
  );
  const answers = decisionObject(result.answers);
  requireDecisionResponse(
    Object.keys(answers).length === Object.keys(questions).length,
  );
  const entries = Object.entries(questions).map(([key, question]) => {
    requireDecisionResponse(Object.hasOwn(answers, key));
    const answer = decisionObject(answers[key]);
    requireDecisionResponse(answer.type === question.type);
    if (question.type === "noul")
      return [key, { type: "noul", noul: probability(answer.noul) }];
    const confidence = probability(answer.confidence);
    if (question.type === "choice") {
      const labels = Object.keys(question.criteria);
      requireDecisionResponse(
        typeof answer.choice === "string" && labels.includes(answer.choice),
      );
      const probabilities = distribution(answer.probabilities, labels);
      requireDecisionResponse(
        probabilities[answer.choice]! + DECISION_PROBABILITY_TOLERANCE >=
          Math.max(...Object.values(probabilities)),
      );
      return [
        key,
        { type: "choice", choice: answer.choice, probabilities, confidence },
      ];
    }
    const labels = question.criteria.map((_, index) => String(index));
    requireDecisionResponse(
      typeof answer.score === "number" &&
        Number.isFinite(answer.score) &&
        !Object.is(answer.score, -0) &&
        answer.score >= 0 &&
        answer.score <= labels.length - 1,
    );
    const probabilities = distribution(answer.probabilities, labels, true);
    const expected = Object.entries(probabilities).reduce(
      (sum, [level, p]) => sum + Number(level) * p,
      0,
    );
    const roundingError = Object.keys(probabilities).reduce(
      (sum, level) => sum + Number(level) * DECISION_ROUNDING_ERROR,
      DECISION_ROUNDING_ERROR,
    );
    requireDecisionResponse(
      Math.abs(answer.score - expected) <=
        DECISION_PROBABILITY_TOLERANCE + roundingError,
    );
    const legend =
      answer.legend === undefined ? undefined : decisionObject(answer.legend);
    if (legend)
      requireDecisionResponse(
        Object.keys(legend).length === labels.length &&
          labels.every((label) => typeof legend[label] === "string"),
      );
    return [
      key,
      {
        type: "score",
        score: answer.score,
        confidence,
        probabilities,
        ...(legend ? { legend } : {}),
      },
    ];
  });
  if (result.metadata !== undefined) {
    try {
      checkpointValue(result.metadata);
    } catch {
      throw new OutpostError(
        "response",
        "Decision metadata must be lossless JSON",
      );
    }
  }
  // Every key and primitive has been checked against its declaring question.
  return Object.fromEntries(entries) as DecisionAnswers<Q>;
}
