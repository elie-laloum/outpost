import type { Agent } from "../domain/agent.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { WorkflowInputQuestion } from "../domain/workflow/input.types.ts";
import type { FileWorkspaceOptions } from "./file-workspace.types.ts";
import type {
  FileWorkspaceRecord,
  FileWorkspaceSource,
} from "../domain/file-workspace.types.ts";

export interface FileInteractiveAgentTaskOptions
  extends
    Omit<
      InteractiveAgentTaskOptions,
      "repository" | "bootstrap" | "conversationHome" | "sandboxProvider"
    >,
    Omit<FileWorkspaceOptions, "source"> {
  readonly workspaceSource: FileWorkspaceSource;
  readonly sandboxProvider: SandboxProvider;
}

export interface FileInteractiveAgentResult {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly directory: string;
  readonly turns: number;
  readonly workspaceInfo: FileWorkspaceRecord;
}

export interface FileInteractiveAgentState {
  readonly format: 1;
  readonly turns: number;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly conversation?: string;
  readonly completed?: FileInteractiveAgentResult;
}

export interface InteractiveAgentTaskOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly repository: string;
  readonly agent: Agent;
  readonly brief: string;
  readonly actors: readonly string[];
  readonly sandboxProvider?: SandboxProvider;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly maxTurns?: number;
  readonly timeoutMs?: number;
}

export type InteractiveAgentResult = {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly branch: string;
  readonly directory: string;
  readonly turns: number;
};

export type InteractiveAgentTurn =
  | ({ readonly kind: "question" } & WorkflowInputQuestion)
  | { readonly kind: "completed"; readonly output: WorkflowJson };

export type InteractiveAgentState = {
  readonly turns: number;
  readonly branch: string;
  readonly directory: string;
  readonly conversation?: string;
  readonly completed?: InteractiveAgentResult;
};

export interface InteractiveAgentTurnResult {
  readonly next: InteractiveAgentState & { readonly conversation: string };
  readonly value: InteractiveAgentTurn;
}
