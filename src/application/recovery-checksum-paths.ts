import { recoveryTransferPatches } from "./recovery-verification.constants.ts";
import type { RecoveryTransferState } from "./recovery-verification.types.ts";

export function recoveryChecksumPaths(state: RecoveryTransferState): string[] {
  return [
    "state.json",
    ...recoveryTransferPatches,
    ...(state.previous !== state.next ? ["commits.bundle"] : []),
    ...state.previousExtras.map((path) => `previous-files/${path}`),
    ...state.incoming.map((path) => `incoming/${path}`),
  ];
}
