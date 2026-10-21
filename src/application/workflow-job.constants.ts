export const workflowJobNextActions = {
  done: "none",
  failed: "inspect",
  cancelled: "inspect",
  rejected: "inspect",
  paused: "inspect-pause",
  "waiting-input": "answer",
} as const;
