export const telemetryNames = {
  dispatches: "outpost.dispatch.executions",
  dispatchDuration: "outpost.dispatch.duration",
  dispatchTokens: "outpost.dispatch.tokens",
  workflows: "outpost.workflow.executions",
  tasks: "outpost.task.executions",
  attempts: "outpost.task.attempts",
  retries: "outpost.task.retries",
  usage: "outpost.agent.tokens",
  workflowDuration: "outpost.workflow.duration",
  taskDuration: "outpost.task.duration",
  attemptDuration: "outpost.task.attempt.duration",
} as const;
