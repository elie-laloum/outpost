---
title: "Gérer les échecs et choisir les reprises"
description: "Observez une tâche en échec et vérifiez qu’une tâche dépendante ne s’exécute pas."
---

Observez une tâche en échec et vérifiez qu’une tâche dépendante ne s’exécute pas.

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
import { task, workflow } from "@elie-laloum/outpost";

const validate = task({
  key: "validate",
  perform: () => {
    throw new Error("Whitespace regression");
  },
});
let delivered = false;
const deliver = task({
  key: "deliver",
  after: [validate],
  perform: () => {
    delivered = true;
  },
});
const result = await workflow("failed-validation", [validate, deliver]).start();
assert.equal(result.status, "failed");
assert.equal(delivered, false);
assert.throws(() => result.unwrap());
console.log(result.tasks.map(({ key, status }) => ({ key, status })));
```

```sh
node example.mts
```

## Comprendre le résultat

La validation échoue et la livraison est ignorée. Le résultat conserve les états des tâches et les erreurs originales ; `unwrap()` transforme un non-succès en `WorkflowFailure`. Une reprise répète les effets de la tâche : configurez-la uniquement lorsque vous maîtrisez sa répétition. Utilisez des dépendances pour les ressources partagées et des sandboxes indépendantes pour les agents parallèles.

[Contrats, options et cas particuliers](../../../reference/behavior/workflows/execution/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
