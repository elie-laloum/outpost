---
title: "Attendre une décision explicite"
description: "Persistez une demande d’approbation et transmettez une décision locale explicite."
---

Persistez une demande d’approbation et transmettez une décision locale explicite.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.

</details>

<!-- /preparation -->

## Essayer

Enregistrez le fichier **example.mts** dans `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  approvalTask,
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const action = process.argv[2] ?? "approve";
if (action !== "approve" && action !== "reject")
  throw new Error("Use approve or reject");
const approval = approvalTask({
  key: "review",
  prompt: "Accept the text report?",
  actors: ["workshop-reader"],
});
const deliver = task({
  key: "deliver",
  after: [approval],
  perform: () => ({ delivered: true }),
});
const plan = workflow("reviewed-report", [approval, deliver]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: "./state/approvals" }),
  runId: randomUUID(),
  version: "1",
};
const paused = await plan.start({ checkpoint });
assert.equal(paused.status, "paused");
const request = paused.tasks.find(
  (record) => record.key === approval.key,
)?.pause;
if (!request) throw new Error("Expected a persisted approval request");
console.log("paused", request.id);
const decided = await plan.start({
  checkpoint,
  decisions: [
    {
      executionId: paused.executionId,
      key: approval.key,
      requestId: request.id,
      action,
      actor: "workshop-reader",
      reason: "Explicit local demonstration decision",
    },
  ],
});
assert.equal(decided.status, action === "approve" ? "done" : "failed");
console.log(decided.status);
```

```sh
node example.mts
```

## Comprendre le résultat

Le script affiche `paused`, puis `done`. Lancez `node example.mts reject` pour voir le rejet empêcher la livraison. L’exemple fournit volontairement un acteur local de confiance ; son nom n’authentifie pas une personne. Dans une application, authentifiez l’appelant avant de soumettre sa décision. Un résultat en pause est attendu : examinez son statut avant `unwrap()`.

[Contrats, options et cas particuliers](../../../reference/behavior/workflows/approvals/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
