import type {
  RecoveryChecksumResult,
  RecoveryIntegrity,
} from "./recovery-checksums.types.ts";
export interface RecoveryTransferState {
  readonly previous: string;
  readonly next: string;
  readonly previousExtras: readonly string[];
  readonly incoming: readonly string[];
}

export interface RecoveryStructureCheck {
  readonly path: string;
  readonly status: "pass" | "fail";
  readonly code: string;
}

export interface RecoveryVerification {
  readonly directory: string;
  readonly scope: "transfer-structure" | "transfer-restorability";
  readonly complete: boolean;
  readonly integrity: RecoveryIntegrity;
  readonly checksums?: RecoveryChecksumResult;
  readonly checks: readonly RecoveryStructureCheck[];
}

export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
