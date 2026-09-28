import type { WorkflowUsage } from "../domain/workflow/budget.types.ts";
import type {
  SpeculativeCandidateResult,
  SpeculativeHostSnapshot,
} from "./speculation.types.ts";

export interface SpeculationAttempt<T> {
  key: string;
  attempt: number;
  branch: string;
  phase: "waiting" | "running" | "validated" | "settled";
  resourceId?: string;
  directory?: string;
  cleanup: "pending" | "done";
  accepted?: boolean;
  record?: SpeculativeCandidateResult<T>;
}
export interface SpeculationCheckpoint<T> {
  format: 1;
  identity: string;
  id: string;
  before: SpeculativeHostSnapshot;
  attempts: SpeculationAttempt<T>[];
  usage: WorkflowUsage;
  finished: boolean;
  status?: "winner" | "no-winner" | "quota" | "aborted" | "budget-exhausted";
  error?: string;
}
