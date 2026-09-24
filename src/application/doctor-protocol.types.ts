import type { DiagnosticCheck, DoctorAgent } from "./doctor.types.ts";

export interface AgentProtocolReport {
  readonly scope: "bundled-protocol-fixtures";
  readonly agent: DoctorAgent;
  readonly referenceVersion: string;
  readonly installedCli: "unverified";
  readonly modelCompatibility: "unverified";
  readonly checks: readonly DiagnosticCheck[];
  readonly hasFailures: boolean;
}
