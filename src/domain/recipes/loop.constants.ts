export const recipeLoopKeys = {
  loop: ["maxRounds", "attempt", "check"],
  attemptAgent: ["agent", "brief", "conversation", "followUp", "dispatch"],
  checkAgent: ["agent", "brief", "dispatch", "done"],
  command: ["command"],
} as const;

/** Hints for loop step fields declared where they do not apply. */
export const recipeLoopFieldHints: Readonly<Record<string, string>> = {
  conversation:
    "conversation applies to attempt agents; a check agent starts a new conversation each round.",
  followUp:
    "followUp applies to attempt agents; a check agent receives its brief each round.",
  done: "done applies to check agents that declare a custom JSON response in dispatch.",
  dispatch:
    "dispatch applies to agent steps; set deadlineMs on the command instead.",
};

/** Loop values each declarative loop field may interpolate; `done` reads none. */
export const recipeLoopValues = {
  attempt: ["round", "feedback"],
  check: ["round", "text"],
  command: ["round"],
} as const;

/** Brief of later rounds in a continued conversation when the step declares no followUp. */
export const recipeLoopFollowUp =
  "The check rejected your previous attempt:\n\n{{ loop.feedback }}\n\nAddress this feedback, then complete the task.";
