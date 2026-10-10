---
title: "Exiger des approbations signées"
description: "Vérifier la signature d’un approbateur avant de reprendre le workflow."
---

Utilisez une décision signée lorsque les workers doivent vérifier une preuve fournie par votre service d’approbation. Créez d’abord une [étape d’approbation et son checkpoint](../approvals/), avec `authentication: "signed"` sur cette étape. Le service de signature conserve la clé privée ; les workers ne reçoivent que les clés publiques.

## Exiger une décision signée

Avec `authentication: "signed"` sur l’étape d’approbation, une décision doit porter une signature Ed25519 d’une clé liée à son acteur. Seul votre service de signature détient les clés privées ; gardez-les hors des sandboxes des workers.

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

La signature couvre tous les champs de la décision, plus `keyId` et `expiresAt`. Chaque `WorkflowApproverKey` lie un `keyId` à un seul `actor` et à sa `publicKey`.

L’expiration est vérifiée avec l’horloge du worker : gardez le service de signature et les workers synchronisés. Les décisions altérées ou expirées, et les clés inconnues, dupliquées ou liées à un autre acteur, sont refusées. Le checkpoint conserve le `keyId` vérifié, et une reprise qui retire `authentication` est refusée.

## Renouveler les clés des approbateurs

1. Ajoutez la nouvelle clé publique avec un nouveau `keyId` pour la même personne, en gardant l’ancienne clé.
2. Signez les nouvelles décisions avec la nouvelle clé privée. Les deux clés publiques vérifient encore les preuves en cours.
3. Retirez l’ancienne clé publique. Les nouvelles preuves qui l’utilisent échouent ; les approbations déjà enregistrées restent valides.

`keys` s’exécute pour chaque décision signée : les changements s’appliquent sans redémarrage.
