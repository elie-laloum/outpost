import type { WorkflowResult } from "../workflow.types.ts";

export class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult) {
    super(`Workflow ${result.name} ${result.status}`, {
      cause: result.errors[0],
    });
    this.name = "WorkflowFailure";
    this.result = result;
  }
}
