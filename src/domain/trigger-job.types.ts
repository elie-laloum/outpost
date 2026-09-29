import type { WorkflowJson } from "./workflow/checkpoint.types.ts";

/** Work requested by a schedule or webhook route, published as a queue job. */
export interface TriggerJob {
  /** Registered queue worker handler, usually a `workflowJob()`. */
  readonly handler: string;
  /** Checkpoint run identifier; events for the same run converge on one checkpoint. */
  readonly runId: string;
  readonly input?: WorkflowJson;
}

/** Queue input carried by trigger jobs. */
export interface TriggerJobInput {
  readonly runId: string;
  readonly input: WorkflowJson;
}
