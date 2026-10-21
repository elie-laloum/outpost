import type { WorkflowResult } from "../domain/workflow.types.ts";
import type { WorkflowJobNextAction } from "./workflow-job.types.ts";

export const workflowJobNextActions = {
  done: "none",
  failed: "inspect",
  cancelled: "inspect",
  rejected: "inspect",
  paused: "inspect-pause",
  "waiting-input": "answer",
} as const satisfies Readonly<
  Record<WorkflowResult["status"], WorkflowJobNextAction>
>;
