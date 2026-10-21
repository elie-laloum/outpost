import type { RecipeRunStatus } from "../application/recipes/durable.types.ts";

export function recipeStatusText(
  runId: string,
  status: RecipeRunStatus | undefined,
): string {
  if (!status) return `Run: ${runId}\nStatus: not found\n`;
  const state = status.owned
    ? "owned"
    : (status.report?.status ?? "interrupted");
  let action =
    "Inspect the saved task records before authorizing recovery or replay.";
  if (state === "done") action = "No continuation required.";
  if (state === "waiting-input")
    action =
      "Answer the pending question using recipe answer with this run ID.";
  if (state === "paused")
    action =
      "Inspect the pending gate or quota pause, then decide or resume this run.";
  if (status.owned)
    action =
      "The run has an owner. Verify it has stopped before any explicit recovery.";
  return [
    `Run: ${runId}`,
    `Status: ${state}`,
    ...(status.executionId ? [`Execution: ${status.executionId}`] : []),
    ...(status.report?.observationId
      ? [`Observation: ${status.report.observationId}`]
      : []),
    ...status.tasks
      .filter((task) => ["waiting-input", "paused"].includes(task.status))
      .map((task) => `Pending task: ${task.key} (${task.status})`),
    `Retained workspaces: ${Object.keys(status.workspaces).length}`,
    `Next action: ${action}`,
    "Use the same recipe and configuration for continuation.",
    "",
  ].join("\n");
}
