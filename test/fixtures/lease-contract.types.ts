import type { SandboxLease } from "../../src/domain/sandbox.types.ts";

export type LeaseContractOutcome =
  "pass" | "capability-unavailable" | "unix-host-required";

export interface LeaseContractCheck {
  readonly name: string;
  readonly run: (
    lease: SandboxLease,
    directory: string,
    signal: AbortSignal,
  ) => Promise<LeaseContractOutcome>;
}
