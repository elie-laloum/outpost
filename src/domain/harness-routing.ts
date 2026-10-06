import { agentModel } from "./agent-model.ts";
import { invariant } from "./errors.ts";
import { defineDecision, validateDecisionProvider } from "./decision.ts";
import {
  HARNESS_ROUTING_MIN_CONFIDENCE,
  HARNESS_ROUTING_FIELDS,
} from "./harness-routing.constants.ts";
import type { DecisionQuestions } from "./decision.types.ts";
import type { ModelSpec } from "./model.types.ts";
import type {
  HarnessModelRouting,
  HarnessModelRoutingOptions,
  RoutingQuestion,
} from "./harness-routing.types.ts";

export function defineHarnessModelRouting<
  const Q extends DecisionQuestions,
  const Key extends RoutingQuestion<Q>,
>(options: HarnessModelRoutingOptions<Q, Key>): HarnessModelRouting {
  invariant(
    options &&
      typeof options === "object" &&
      Object.keys(options).every((key) => HARNESS_ROUTING_FIELDS.has(key)),
    "Unsupported harness routing options",
  );
  validateDecisionProvider(options.provider);
  invariant(
    typeof options.model === "string" && options.model.trim(),
    "Routing decision model must be nonempty text",
  );
  invariant(
    options.decision?.kind === "decision",
    "Declare routing decisions with defineDecision",
  );
  const decision = defineDecision({ questions: options.decision.questions });
  const question = decision.questions[options.question];
  invariant(
    question?.type === "choice",
    "Harness routing requires a choice question",
  );
  invariant(
    options.models &&
      typeof options.models === "object" &&
      !Array.isArray(options.models),
    "Routing models must be a map",
  );
  const labels = Object.keys(question.criteria);
  invariant(
    Object.keys(options.models).length === labels.length &&
      labels.every((label) => Object.hasOwn(options.models, label)),
    "Routing models must match every choice exactly",
  );
  invariant(
    typeof options.fallback === "string" &&
      Object.hasOwn(options.models, options.fallback),
    "Routing fallback must name a candidate",
  );
  const minConfidence = options.minConfidence ?? HARNESS_ROUTING_MIN_CONFIDENCE;
  invariant(
    Number.isFinite(minConfidence) && minConfidence >= 0 && minConfidence <= 1,
    "Routing minConfidence must be between 0 and 1",
  );
  invariant(
    options.onError === undefined ||
      options.onError === "fallback" ||
      options.onError === "fail",
    "Routing onError must be fallback or fail",
  );
  invariant(
    options.state === undefined || typeof options.state === "function",
    "Routing state must be a function",
  );
  const candidates: Readonly<Record<string, ModelSpec>> = options.models;
  const models = Object.fromEntries(
    Object.entries(candidates).map(([key, model]) => [key, agentModel(model)]),
  );
  return Object.freeze({
    kind: "model-routing",
    provider: options.provider,
    model: options.model,
    decision,
    question: String(options.question),
    models: Object.freeze(models),
    minConfidence,
    fallback: options.fallback,
    onError: options.onError ?? "fallback",
    ...(options.state ? { state: options.state } : {}),
  });
}
