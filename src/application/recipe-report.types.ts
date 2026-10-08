import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { WorkflowResult } from "../domain/workflow.types.ts";

export interface RecipeDiagnostic {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly cause?: RecipeDiagnostic;
}

export interface RecipeReport {
  readonly runId?: string;
  readonly inputRequests?: WorkflowResult["inputRequests"];
  readonly observerErrors?: readonly RecipeDiagnostic[];
  readonly name: string;
  readonly executionId?: string;
  readonly status: WorkflowResult["status"];
  readonly workflowStatus?: WorkflowResult["status"];
  readonly tasks: WorkflowResult["tasks"];
  readonly usage?: WorkflowResult["usage"];
  readonly outputs: Readonly<
    Record<string, Readonly<Record<string, WorkflowJson>>>
  >;
  readonly errors: readonly RecipeDiagnostic[];
  readonly workspace?: {
    readonly branch: string;
    readonly directory: string;
    readonly retainedDirectory?: string;
  };
}
