---
title: "Relier les tâches par leurs résultats typés"
description: "Transformez du texte en deux tâches et lisez le résultat grâce à l’identité de sa tâche."
---

Transformez du texte en deux tâches et lisez le résultat grâce à l’identité de sa tâche.

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

const source = task({ key: "source", perform: () => "  Hello   World  " });
const slug = task({
  key: "slug",
  after: [source],
  perform: (context) =>
    context.value(source).trim().toLowerCase().replace(/\s+/g, "-"),
});
const plan = workflow("text-pipeline", [source, slug]);
const result = await plan.start();
result.unwrap();
assert.equal(result.value(slug), "hello-world");
console.log(result.value(slug));
console.log(plan.diagram());
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie est `hello-world`, suivie du graphe Mermaid des dépendances. `after` ordonne l’exécution et autorise la lecture de la valeur de cette tâche. Une clé nomme une tâche ; son objet identifie le résultat typé. Le graphe rejette clés dupliquées, dépendances absentes et cycles avant exécution. Une dépendance en échec ou ignorée empêche le travail en aval.

[Contrats, options et cas particuliers](../../behavior/workflows/graph/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
