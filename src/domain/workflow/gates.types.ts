import type { Task } from "../workflow.types.ts";

export interface WorkflowGate {
  readonly authentication?: "signed";
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}

export interface WorkflowGateOptions {
  readonly authentication?: "signed";
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
  readonly proof?: WorkflowDecisionProof;
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}

export interface WorkflowDecisionProof {
  readonly keyId: string;
  readonly expiresAt: string;
  readonly signature: string;
}

export interface WorkflowDecisionVerification {
  readonly keyId: string;
  readonly verifiedAt: string;
}

export type WorkflowDecisionVerifier = (
  decision: WorkflowDecision,
) => Promise<WorkflowDecisionVerification> | WorkflowDecisionVerification;

export interface WorkflowDecisionRecord extends Omit<
  WorkflowDecision,
  "proof"
> {
  readonly verification?: WorkflowDecisionVerification;
  readonly decidedAt: string;
}
