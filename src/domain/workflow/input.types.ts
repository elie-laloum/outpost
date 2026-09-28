import type { WorkflowJson } from "./checkpoint.types.ts";

export interface WorkflowInputQuestion {
  readonly question: string;
  readonly choices?: readonly string[];
  readonly allowFreeText?: boolean;
}

export interface WorkflowInputRequest extends WorkflowInputQuestion {
  readonly id: string;
  readonly executionId: string;
  readonly key: string;
  readonly requestedAt: string;
}

export interface WorkflowAnswer {
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly actor: string;
  readonly value: string;
}

export interface WorkflowAnswerRecord extends WorkflowAnswer {
  readonly answeredAt: string;
}

export interface TaskInteraction {
  readonly actors: readonly string[];
  readonly identity: string;
}

export interface TaskInteractionRecord {
  readonly state?: WorkflowJson;
  readonly request?: WorkflowInputRequest;
  readonly answer?: WorkflowAnswerRecord;
}

export interface TaskInteractionContext {
  readonly state: WorkflowJson | undefined;
  readonly answer: WorkflowAnswerRecord | undefined;
  save(state: WorkflowJson): Promise<void>;
  suspend(question: WorkflowInputQuestion, state: WorkflowJson): never;
}
