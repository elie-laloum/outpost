---
title: "Transformer une réponse en données typées"
description: "Validez une réponse avant de l’utiliser dans une autre tâche. Ce premier exemple isole l’analyse des appels aux modèles."
---

Validez une réponse avant de l’utiliser dans une autre tâche. Ce premier exemple isole l’analyse des appels aux modèles.

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
import { response, ResponseError } from "@elie-laloum/outpost";

const report = response.json({
  tag: "report",
  schema(value) {
    if (
      !value ||
      typeof value !== "object" ||
      !("passed" in value) ||
      typeof value.passed !== "boolean"
    )
      throw new Error("Expected a passed boolean");
    return { passed: value.passed };
  },
});
const value = await report.read('<report>{"passed":true}</report>');
assert.equal(value.passed, true);
await assert.rejects(
  report.read('<report>{"passed":"yes"}</report>'),
  ResponseError,
);
console.log(value);
```

```sh
node example.mts
```

## Comprendre le résultat

Le résultat est `{ passed: true }` ; la seconde réponse est rejetée car une chaîne n’est pas un booléen. Passez cette même spécification comme `response` à `dispatch` pour obtenir `result.value`. Le schéma valide les données, pas la véracité d’une affirmation de l’agent. Exécutez une vraie commande de test pour vérifier du code. La recette de rapport typé relie cet exemple à un agent réel.

[Contrats, options et cas particuliers](../../behavior/agents/responses/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.

Utilisez des [schémas Zod, Valibot ou Ajv](../schemas/) pour remplacer les vérifications manuelles et partager un schéma avec les artefacts JSON.
