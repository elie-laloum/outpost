export { recoverSpeculation } from "../infrastructure/speculation-store.ts";
export type { SpeculationRecoveryOptions } from "../infrastructure/speculation-store.types.ts";
export { checkSpeculationIntegration } from "../application/speculation-integration.ts";
export { speculate } from "../application/speculation.ts";
export type {
  SpeculationDurability,
  SpeculationIntegration,
  SpeculationOptions,
  SpeculationResult,
  SpeculativeCandidate,
  SpeculativeCandidateResult,
  SpeculativeOutput,
  SpeculativeHostSnapshot,
  SpeculativeValidation,
} from "../application/speculation.types.ts";
