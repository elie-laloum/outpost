---
title: "Exécuter un workflow parallèle sans agent"
description: "Collectez trois vérifications indépendantes, puis assemblez un rapport après leur terminaison."
---

Collectez trois vérifications indépendantes, puis assemblez un rapport après leur terminaison.

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
import { task, workflow } from "@elie-laloum/outpost";

const sources = ["configuration", "execution", "recovery"].map((name) =>
  task({
    key: name,
    perform: async ({ signal }) => {
      signal.throwIfAborted();
      return { name, checked: true };
    },
  }),
);

const report = task({
  key: "report",
  after: sources,
  perform: (context) => sources.map((source) => context.value(source)),
});

const plan = workflow("offline-example", [...sources, report]);
const result = await plan.start({ concurrency: 3 });
result.unwrap();
console.log(JSON.stringify(result.value(report), null, 2));
console.log(plan.diagram());
```

```sh
node example.mts
```

## Comprendre le résultat

Le rapport JSON contient les vérifications configuration, execution et recovery. `concurrency: 3` autorise trois tâches indépendantes ; le rapport attend toutes ses dépendances. Il s’agit d’une vraie exécution de workflow sans appel modèle ni conteneur.

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
