---
title: "Require signed approvals"
description: "Verify an approver’s signature before resuming a gated workflow."
---

Use signed decisions when your workers must verify proof from an approval service. First create an [approval gate and checkpoint](../approvals/); set `authentication: "signed"` on that gate. The signing service owns the private key, and workers receive only the public keys.

## Require a signed decision

With `authentication: "signed"` on the gate, a decision needs an Ed25519 signature from a key bound to its actor. Only your signing service holds private keys; keep them out of worker sandboxes.

<!-- tabs -->

```ts title="sign.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";
import { signWorkflowDecision } from "@elie-laloum/outpost";

export function sign(decision: WorkflowDecision, privateKey: KeyObject) {
  return signWorkflowDecision({
    decision,
    privateKey,
    keyId: "maintainer-2026",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
}
```

```ts title="submission.types.ts"
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowDecision,
  WorkflowApproverKey,
} from "@elie-laloum/outpost";

export interface SignedSubmission {
  workflow: Workflow;
  checkpoint: WorkflowCheckpointOptions;
  signed: WorkflowDecision;
  keys: () => Promise<readonly WorkflowApproverKey[]>;
}
```

```ts title="submit.ts"
import type { SignedSubmission } from "./submission.types.ts";
import { createEd25519DecisionVerifier } from "@elie-laloum/outpost";

export function submit({
  workflow,
  checkpoint,
  signed,
  keys,
}: SignedSubmission) {
  return workflow.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: createEd25519DecisionVerifier({ keys }),
  });
}
```

The signature covers every decision field plus `keyId` and `expiresAt`. Each `WorkflowApproverKey` binds a `keyId` to one `actor` and its `publicKey`.

Expiry is checked against the worker clock, so keep the signing service and workers in time sync. Altered or expired decisions, and keys that are unknown, duplicated or bound to another actor, are rejected. The checkpoint keeps the verified `keyId`, and a restart that drops `authentication` is rejected.

## Rotate approver keys

1. Add the new public key under a new `keyId` for the same actor, keeping the old key.
2. Sign new decisions with the new private key. Both public keys still verify proofs in flight.
3. Remove the old public key. New proofs using it fail; previously recorded approvals remain valid.

`keys` runs for every signed decision, so changes apply without a restart.
