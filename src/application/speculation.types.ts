import type { Transport } from "../domain/transport.types.ts";
import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type {
  WorkflowBudget,
  WorkflowUsage,
} from "../domain/workflow/budget.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { QuotaFault } from "../domain/quota.types.ts";
import type {
  Sandbox,
  SandboxOptions,
  WarmDispatchResult,
} from "./outpost.types.ts";

export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: DispatchAgent;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}

export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork" | "report"
>;

export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}

export interface SpeculationDurability {
  readonly transporter: Transport;
  readonly runId: string;
  readonly version: string;
  readonly resume?: "retry-incomplete";
}

export interface SpeculationIntegration {
  readonly status: "clean" | "conflict" | "blocked";
  readonly host: SpeculativeHostSnapshot;
  readonly candidateCommit?: string;
  readonly conflicts: readonly string[];
  readonly reason?: string;
}

export interface SpeculationOptions<T = undefined> {
  readonly durability?: SpeculationDurability;
  readonly cleanupMs?: number;
  readonly observation?: import("../domain/observation.types.ts").ObservationHub;
  readonly repository: string;
  readonly sandboxProvider: NonNullable<SandboxOptions["sandboxProvider"]>;
  readonly candidates: readonly SpeculativeCandidate<T>[];
  readonly concurrency?: number;
  readonly select?: "first" | "best";
  readonly score?: (
    candidate: SpeculativeValidation<T>,
  ) => number | Promise<number>;
  readonly budget: WorkflowBudget;
  readonly signal?: AbortSignal;
  readonly sandbox?: Pick<
    SandboxOptions,
    | "hooks"
    | "bootstrap"
    | "logging"
    | "limits"
    | "storageQuota"
    | "conversationHome"
  >;
  readonly validate: (
    candidate: SpeculativeValidation<T>,
  ) => boolean | Promise<boolean>;
}

export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly score?: number;
  readonly commit?: string;
  readonly attempt?: number;
  readonly cleanup?: "pending" | "done";
  readonly resourceId?: string;
  readonly branch: string;
  readonly status:
    "winner" | "rejected" | "failed" | "quota" | "cancelled" | "skipped";
  /** Usage or rate limit that stopped this candidate. */
  readonly quota?: QuotaFault;
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}

export interface SpeculationResult<T = undefined> {
  readonly integration?: SpeculationIntegration;
  readonly previousAttempts?: readonly SpeculativeCandidateResult<T>[];
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status:
    "winner" | "no-winner" | "quota" | "aborted" | "budget-exhausted";
  /** Earliest known reset among candidates stopped by a usage or rate limit. */
  readonly quota?: QuotaFault;
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}

export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
