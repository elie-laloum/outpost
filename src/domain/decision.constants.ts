export const DECISION_MAX_CHOICES = 255;
export const DECISION_MAX_LEVELS = 10;
export const DECISION_PROBABILITY_TOLERANCE = 0.00001;
// Native four-decimal rounding can shift each value by half of its last unit.
export const DECISION_ROUNDING_ERROR = 0.00005;
export const INCOMPLETE_DECISION_USAGE = Object.freeze({
  input: 0,
  cached: 0,
  output: 0,
  complete: false,
});

export const DECISION_QUESTION_TYPES = ["choice", "score", "noul"] as const;
export const DECISION_QUESTION_FIELDS = new Set([
  "type",
  "instructions",
  "criteria",
]);
