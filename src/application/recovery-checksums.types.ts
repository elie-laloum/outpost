import type { InspectionHash } from "../infrastructure/inspection-hash.types.ts";
import type { RecoveryStructureCheck } from "./recovery-verification.types.ts";

export interface RecoveryChecksumEntry extends InspectionHash {
  readonly path: string;
}
export interface RecoveryChecksumManifest {
  readonly version: 1;
  readonly algorithm: "sha256";
  readonly entries: readonly RecoveryChecksumEntry[];
}
export type RecoveryIntegrity =
  "unverified" | "checksums-match" | "checksums-mismatch";
export interface RecoveryChecksumResult {
  readonly integrity: RecoveryIntegrity;
  readonly bytesChecked: number;
  readonly maxBytes: number;
  readonly checks: readonly RecoveryStructureCheck[];
}
