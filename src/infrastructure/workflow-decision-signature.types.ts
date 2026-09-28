import type { KeyObject } from "node:crypto";
import type { WorkflowDecision } from "../domain/workflow/gates.types.ts";

export interface WorkflowDecisionSigningOptions {
  readonly decision: Omit<WorkflowDecision, "proof">;
  readonly keyId: string;
  readonly privateKey: KeyObject;
  readonly expiresAt: string;
}

export interface WorkflowApproverKey {
  readonly keyId: string;
  readonly actor: string;
  readonly publicKey: KeyObject;
}

export interface WorkflowDecisionVerifierOptions {
  readonly keys: () =>
    readonly WorkflowApproverKey[] | Promise<readonly WorkflowApproverKey[]>;
}
