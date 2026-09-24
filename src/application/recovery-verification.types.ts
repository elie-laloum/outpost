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
  readonly scope: "transfer-structure";
  readonly complete: boolean;
  readonly integrity: "unverified";
  readonly checks: readonly RecoveryStructureCheck[];
}
