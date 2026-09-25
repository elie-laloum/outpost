import type { Transport } from "../domain/transport.types.ts";
import type {
  LocalProcessIdentity,
  LockOwnership,
} from "./git/process-identity.types.ts";
import type { StorageIssue } from "./storage-inventory.types.ts";
import type {
  resourceOperationKinds,
  resourcePhases,
} from "./resource-activity.constants.ts";

export type ResourcePhase = (typeof resourcePhases)[number];
export type ResourceOperationKind = (typeof resourceOperationKinds)[number];
export interface ResourceOperation {
  readonly count: number;
  readonly kind: ResourceOperationKind;
  readonly startedAt: string;
}
export interface ResourceOperationResult extends ResourceOperation {
  readonly id: string;
  readonly finishedAt: string;
  readonly outcome: "completed" | "failed";
}
export interface ResourceActivityRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: LocalProcessIdentity;
  readonly provider: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly workspace: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: ResourcePhase;
  readonly operations: readonly ResourceOperation[];
  readonly lastOperation?: ResourceOperationResult;
  readonly lastFailure?: ResourceOperationResult;
}
export interface ResourceActivity {
  idle(): Promise<boolean>;
  phase(phase: ResourcePhase): Promise<void>;
  run<T>(kind: ResourceOperationKind, action: () => Promise<T>): Promise<T>;
  remove(): Promise<void>;
}
export interface ResourceActivityOptions {
  readonly transporter?: Transport;
  readonly repository: string;
  readonly workspace: string;
  readonly provider: string;
  readonly placement: ResourceActivityRecord["placement"];
}
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
