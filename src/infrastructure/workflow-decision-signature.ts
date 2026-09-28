import {
  workflowDecisionSignatureDomain,
  workflowDecisionKeyIdMaxLength,
  workflowDecisionSignaturePattern,
  workflowDecisionActions,
} from "./workflow-decision-signature.constants.ts";
import { sign, verify } from "node:crypto";
import type {
  WorkflowDecision,
  WorkflowDecisionVerifier,
} from "../domain/workflow/gates.types.ts";
import type {
  WorkflowDecisionSigningOptions,
  WorkflowDecisionVerifierOptions,
} from "./workflow-decision-signature.types.ts";

function payload(decision: WorkflowDecision): Buffer {
  const proof = decision.proof;
  if (
    !proof ||
    typeof proof.keyId !== "string" ||
    !proof.keyId.trim() ||
    proof.keyId.length > workflowDecisionKeyIdMaxLength ||
    typeof proof.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(proof.expiresAt))
  )
    throw new Error("Invalid workflow decision proof");
  const fields = [
    decision.executionId,
    decision.key,
    decision.requestId,
    decision.actor,
    decision.reason,
    decision.action,
  ];
  if (
    fields.some((value) => typeof value !== "string" || !value.trim()) ||
    !workflowDecisionActions.includes(decision.action)
  )
    throw new Error("Invalid signed workflow decision");
  return Buffer.from(
    JSON.stringify([
      workflowDecisionSignatureDomain,
      ...fields,
      proof.keyId,
      proof.expiresAt,
    ]),
  );
}

export function signWorkflowDecision(
  options: WorkflowDecisionSigningOptions,
): WorkflowDecision {
  if (
    options.privateKey.type !== "private" ||
    options.privateKey.asymmetricKeyType !== "ed25519"
  )
    throw new Error(
      "Workflow decision signing requires an Ed25519 private key",
    );
  const decision: WorkflowDecision = {
    ...options.decision,
    proof: {
      keyId: options.keyId,
      expiresAt: options.expiresAt,
      signature: "",
    },
  };
  const bytes = payload(decision);
  if (Date.parse(options.expiresAt) <= Date.now())
    throw new Error("Workflow decision proof expired");
  return Object.freeze({
    ...decision,
    proof: Object.freeze({
      ...decision.proof!,
      signature: sign(null, bytes, options.privateKey).toString("base64url"),
    }),
  });
}

export function ed25519DecisionVerifier(
  options: WorkflowDecisionVerifierOptions,
): WorkflowDecisionVerifier {
  return async (input) => {
    const decision: WorkflowDecision = {
      ...input,
      ...(input.proof ? { proof: { ...input.proof } } : {}),
    };
    const bytes = payload(decision);
    const proof = decision.proof!;
    if (
      typeof proof.signature !== "string" ||
      !workflowDecisionSignaturePattern.test(proof.signature)
    )
      throw new Error("Invalid workflow decision signature");
    const keys = await options.keys();
    const matches = keys.filter((key) => key.keyId === proof.keyId);
    const key = matches[0];
    if (
      matches.length !== 1 ||
      !key ||
      key.actor !== decision.actor ||
      key.publicKey.type !== "public" ||
      key.publicKey.asymmetricKeyType !== "ed25519" ||
      !verify(
        null,
        bytes,
        key.publicKey,
        Buffer.from(proof.signature, "base64url"),
      )
    )
      throw new Error("Invalid or revoked workflow approver key or signature");
    const now = Date.now();
    if (Date.parse(proof.expiresAt) <= now)
      throw new Error("Workflow decision proof expired");
    return Object.freeze({
      keyId: key.keyId,
      verifiedAt: new Date(now).toISOString(),
    });
  };
}
