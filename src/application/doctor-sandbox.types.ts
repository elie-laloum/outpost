import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { DiagnosticCheck, DoctorAgent } from "./doctor.types.ts";

export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
}

export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}

export interface SandboxDiagnosticReport {
  readonly scope: "owned-sandbox";
  readonly ownership: "caller";
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
  readonly capabilities: readonly DiagnosticCapability[];
  readonly checks: readonly DiagnosticCheck[];
  readonly modelCompatibility: "unverified";
  readonly hasFailures: boolean;
}
