---
title: "Reprendre un workflow de texte sauvegardé"
description: "Rouvrez un workflow terminé sans réexécuter ses tâches."
---

Rouvrez un workflow terminé sans réexécuter ses tâches.

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
import {
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

let calls = 0;
const convert = task({
  key: "convert",
  perform: () => {
    calls++;
    return { slug: "hello-world" };
  },
});
const plan = workflow("durable-text", [convert]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: "./state/checkpoints" }),
  runId: "text-1",
  version: "1",
};
const first = await plan.start({ checkpoint });
first.unwrap();
const before = calls;
const resumed = await plan.start({ checkpoint });
resumed.unwrap();
assert.equal(calls, before);
assert.equal(resumed.executionId, first.executionId);
assert.equal(resumed.value(convert).slug, "hello-world");
console.log(resumed.value(convert), "replayed:", calls - before);
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie contient `hello-world` et `replayed: 0`. Relancez le même fichier pour rouvrir le résultat dans un autre processus. Conservez l’identité du graphe et sa `version` ; utilisez un nouvel identifiant pour une exécution indépendante. Les sorties doivent être du JSON sans perte. Le travail interrompu exige une autorisation explicite de rejeu et peut déjà avoir produit des effets externes.

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
