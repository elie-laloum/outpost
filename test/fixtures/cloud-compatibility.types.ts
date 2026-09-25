import type {
  SandboxLease,
  SandboxProvider,
} from "../../src/domain/sandbox.types.ts";

export type CloudName = "vercel" | "daytona";
export interface CompatibilityCheck {
  readonly name: string;
  readonly status: "pass" | "fail" | "skipped";
  readonly reason?: string;
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
