import type {
  WorkflowCheckpoint,
  WorkflowCheckpointOptions,
  WorkflowJson,
} from "../../domain/workflow/checkpoint.types.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { RecipeRunOptions } from "./project.types.ts";
import type { WorkflowAnswer } from "../../domain/workflow/input.types.ts";
import type { WorkflowDecision } from "../../domain/workflow/gates.types.ts";

export interface RecipeResumeOptions extends RecipeRunOptions {
  readonly runId: string;
  readonly retryIncomplete?: boolean;
  readonly answers?: readonly WorkflowAnswer[];
  readonly decisions?: readonly WorkflowDecision[];
  readonly recoverRevision?: string;
}

export interface RecipeWorkspaceCheckpoint {
  readonly state: "allocating" | "ready" | "integrated" | "closed";
  readonly record?: WorkspaceRecord;
}

export interface RecipeCheckpointMetadata {
  readonly format: 1;
  readonly identity: string;
  readonly inputs: Readonly<Record<string, WorkflowJson>>;
  readonly resources: Readonly<Record<string, RecipeWorkspaceCheckpoint>>;
  readonly report?: RecipeReport;
}

export interface RecipePersistedCheckpoint extends WorkflowCheckpoint {
  readonly recipe: RecipeCheckpointMetadata;
}

export interface RecipeCheckpointSession {
  readonly options: WorkflowCheckpointOptions;
  readonly inputs: Readonly<Record<string, WorkflowJson>>;
  readonly previous: RecipePersistedCheckpoint | undefined;
  resource(key: string): RecipeWorkspaceCheckpoint | undefined;
  saveResource(key: string, resource: RecipeWorkspaceCheckpoint): Promise<void>;
  saveReport(report: RecipeReport): Promise<void>;
  close(): Promise<void>;
}

export interface RecipeRunStatus {
  readonly runId: string;
  readonly revision: string;
  readonly owned: boolean;
  readonly executionId?: string;
  readonly report?: RecipeReport;
  readonly tasks: WorkflowCheckpoint["records"];
  readonly usage?: WorkflowCheckpoint["usage"];
  readonly workspaces: Readonly<Record<string, RecipeWorkspaceCheckpoint>>;
}
