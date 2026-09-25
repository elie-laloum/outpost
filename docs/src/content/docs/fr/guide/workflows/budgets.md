---
title: "Borner les tentatives et l’usage observé"
description: "Arrêtez l’admission lorsque le workflow nécessite plus de tentatives que son budget."
---

Arrêtez l’admission lorsque le workflow nécessite plus de tentatives que son budget.

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
import { task, workflow, WorkflowBudgetExceeded } from "@elie-laloum/outpost";

const read = task({ key: "read", perform: () => "hello" });
const convert = task({
  key: "convert",
  after: [read],
  perform: (ctx) => ctx.value(read).toUpperCase(),
});
const result = await workflow("bounded", [read, convert]).start({
  budget: { attempts: 1 },
});
assert.equal(result.status, "failed");
assert.ok(
  result.errors.some((error) => error instanceof WorkflowBudgetExceeded),
);
assert.equal(result.usage.attempts, 1);
console.log(result.status, result.usage.attempts);
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie est `failed 1` : la première tâche termine, mais la seconde ne peut pas démarrer. Les budgets comptent les exécutions de tâches, reprises incluses, pas chaque tour modèle interne. Les limites de tokens utilisent les observations et peuvent être dépassées par du travail concurrent. Ce ne sont pas des plafonds de facturation garantis.

[Contrats, options et cas particuliers](../../behavior/workflows/budgets/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
