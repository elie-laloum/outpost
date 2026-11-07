export const recipeLoopKeys = {
  loop: ["maxRounds", "attempt", "check"],
  attempt: ["agent", "brief", "conversation", "followUp", "dispatch"],
  agentCheck: ["agent", "brief"],
  commandCheck: ["command"],
} as const;

/** Loop values each declarative loop field may interpolate. */
export const recipeLoopValues = {
  attempt: ["round", "feedback"],
  check: ["round", "text"],
  command: ["round"],
} as const;

/** Brief of later rounds in a continued conversation when the recipe declares no followUp. */
export const recipeLoopFollowUp =
  "The check rejected your previous attempt:\n\n{{ loop.feedback }}\n\nAddress this feedback, then complete the task.";
