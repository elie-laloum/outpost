import type { Task } from "../workflow.types.ts";

export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}

export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}

export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}

export interface WorkflowDecision {
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}

export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
