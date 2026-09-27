import type {
  SandboxLease,
  SandboxProvider,
} from "../../src/domain/sandbox.types.ts";

export type CloudName = "vercel" | "daytona";
export type CompatibilityStage =
  | "allocation"
  | "lease-contract"
  | "agent-cli-contract"
  | "authenticated-model-turn";
export type CompatibilityCategory =
  | "allocation"
  | "agent-cli"
  | "agent-authentication"
  | "model-access"
  | "network"
  | "contract"
  | "cleanup";
export type CompatibilityFailureReason =
  | "authentication-rejected"
  | "quota-exceeded"
  | "model-unavailable"
  | "network-unreachable"
  | "deadline-exceeded"
  | "contract-failed";
export interface CompatibilityCheck {
  readonly name: string;
  readonly status: "pass" | "fail" | "skipped";
  readonly reason?: string;
  readonly category?: CompatibilityCategory;
  readonly version?: string;
}
export interface CompatibilityReport {
  readonly sandboxProvider: CloudName;
  readonly status: "pass" | "fail" | "skipped";
  readonly checks: readonly CompatibilityCheck[];
}
export interface CompatibilityOptions {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly create: (name: CloudName) => SandboxProvider;
  readonly verify?: (
    lease: SandboxLease,
    directory: string,
    signal: AbortSignal,
    record: (check: CompatibilityCheck) => void,
  ) => Promise<void>;
  readonly deadlineMs?: number;
  readonly cleanupMs?: number;
}

export interface CompatibilitySource {
  readonly commit: string | null;
  readonly dirty: boolean | null;
}
