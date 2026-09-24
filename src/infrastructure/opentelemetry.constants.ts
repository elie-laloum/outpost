export const telemetryNames = {
  workflows: "outpost.workflow.executions",
  tasks: "outpost.task.executions",
  attempts: "outpost.task.attempts",
  retries: "outpost.task.retries",
  usage: "outpost.agent.tokens",
  workflowDuration: "outpost.workflow.duration",
  taskDuration: "outpost.task.duration",
  attemptDuration: "outpost.task.attempt.duration",
} as const;
