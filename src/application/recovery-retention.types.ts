import type { Transport, TransportEntry } from "../domain/transport.types.ts";
import type { RecoveryInspection } from "./recovery-inspection.types.ts";
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly ("clean-workspaces" | "closed-logs")[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
export interface RecoveryRetentionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly maxEntries?: number;
}
export interface RecoveryRetentionEntry {
  readonly revision?: string;
  readonly objects?: readonly TransportEntry[];
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
export interface RecoveryRetentionPlan {
  readonly source?: "transport";
  readonly repository: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly inspectedAt: string;
  readonly inspection: RecoveryInspection;
  readonly entries: readonly RecoveryRetentionEntry[];
  readonly complete: boolean;
  readonly usageBytes: number;
  readonly projectedBytes: number;
  readonly quota: "within" | "exceeded" | "unknown";
}
export interface RecoveryRetainedEntry {
  readonly path: string;
  readonly reason: string;
}
export interface RecoveryPruneResult {
  readonly removed: readonly string[];
  readonly retained: readonly {
    readonly path: string;
    readonly reason: string;
  }[];
  readonly after: RecoveryRetentionPlan;
}
export interface RecoveryQuotaOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
