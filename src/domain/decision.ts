import { invariant, OutpostError } from "./errors.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";
import {
  DECISION_MAX_CHOICES,
  DECISION_MAX_LEVELS,
  DECISION_QUESTION_TYPES,
  DECISION_QUESTION_FIELDS,
} from "./decision.constants.ts";
import type {
  Decision,
  DecisionOptions,
  DecisionQuestions,
  DecisionState,
  DecisionProvider,
} from "./decision.types.ts";

export function defineDecision<const Q extends DecisionQuestions>(
  options: DecisionOptions<Q>,
): Decision<Q> {
  invariant(
    options &&
      typeof options === "object" &&
      Object.keys(options).every((key) => key === "questions"),
    "Decision accepts questions only",
  );
  invariant(
    options.questions &&
      typeof options.questions === "object" &&
      !Array.isArray(options.questions),
    "Decision questions must be a map",
  );
  const entries = Object.entries(options.questions);
  invariant(entries.length > 0, "Decision requires at least one question");
  decisionJson(options.questions);
  for (const [key, question] of entries) {
    invariant(key.trim(), "Decision question names must be nonempty");
    invariant(
      question &&
        typeof question === "object" &&
        DECISION_QUESTION_TYPES.includes(question.type),
      "Unsupported decision question type",
    );
    invariant(
      Object.keys(question).every((field) =>
        DECISION_QUESTION_FIELDS.has(field),
      ),
      "Unsupported decision question field",
    );
    invariant(
      typeof question.instructions === "string" && question.instructions.trim(),
      "Decision instructions must be nonempty text",
    );
    if (question.type === "score") {
      invariant(
        Array.isArray(question.criteria) &&
          question.criteria.length >= 2 &&
          question.criteria.length <= DECISION_MAX_LEVELS &&
          question.criteria.every(
            (value) => typeof value === "string" && value.trim(),
          ),
        "Decision score requires 2–10 described levels",
      );
      continue;
    }
    if (question.type === "noul" && question.criteria === undefined) continue;
    invariant(
      question.criteria &&
        typeof question.criteria === "object" &&
        !Array.isArray(question.criteria),
      "Decision criteria must be a map",
    );
    const criteria = Object.entries(question.criteria);
    invariant(
      criteria.every(
        ([label, description]) =>
          label.trim() && typeof description === "string" && description.trim(),
      ),
      "Decision criteria require nonempty labels and descriptions",
    );
    if (question.type === "choice") {
      invariant(
        criteria.length >= 2 && criteria.length <= DECISION_MAX_CHOICES,
        "Decision choice requires 2–255 options",
      );
      continue;
    }
    invariant(
      criteria.length === 2 &&
        Object.hasOwn(question.criteria, "true") &&
        Object.hasOwn(question.criteria, "false"),
      "Decision noul criteria require true and false",
    );
  }
  const questions = structuredClone(options.questions);
  for (const question of Object.values(questions)) {
    if (question.criteria) Object.freeze(question.criteria);
    Object.freeze(question);
  }
  return Object.freeze({
    kind: "decision",
    questions: Object.freeze(questions),
  });
}

export function decisionJson(value: unknown): void {
  try {
    checkpointValue(value);
  } catch {
    throw new OutpostError(
      "configuration",
      "Decisions require lossless JSON values",
    );
  }
}

export function validateDecisionState(state: DecisionState): void {
  invariant(
    typeof state === "string" || (state !== null && typeof state === "object"),
    "Decision state must be text, an object or an array",
  );
  decisionJson(state);
}

export function validateDecisionProvider(
  provider: unknown,
): asserts provider is DecisionProvider {
  invariant(
    provider !== null &&
      typeof provider === "object" &&
      "name" in provider &&
      typeof provider.name === "string" &&
      provider.name.trim() &&
      "request" in provider &&
      typeof provider.request === "function",
    "Decision provider must have a name and request function",
  );
}
