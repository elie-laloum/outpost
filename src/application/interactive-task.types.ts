import type { Agent } from "../domain/agent.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { WorkflowInputQuestion } from "../domain/workflow/input.types.ts";

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
