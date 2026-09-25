---
title: "Décorer le stockage natif des conversations"
description: "Implémentez le contrat de stockage indépendamment des commandes d’agent et de l’allocation."
---

Implémentez le contrat de stockage indépendamment des commandes d’agent et de l’allocation.

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
import { conversations } from "@elie-laloum/outpost";
import type { ConversationStore } from "@elie-laloum/outpost";

const native = conversations.native("codex");
const observed: ConversationStore = {
  name: "observed-codex",
  locate: (id, repository, home) => native.locate(id, repository, home),
  async capture(id, context) {
    const record = await native.capture(id, context);
    context.warn?.(`Captured conversation ${record.id}`);
    return record;
  },
  restore: (record, context) => native.restore(record, context),
};
console.log(observed.name);
```

```sh
node example.mts
```

## Comprendre le résultat

Le script construit le store et affiche son nom sans lire d’identifiants ni transcripts. Affectez-le à AgentAdapter.storage dans votre intégration. Capture et restauration réelles nécessitent le contexte natif et le bail. Réécrivez uniquement les métadonnées structurelles du dossier de travail, préservez l’identité en reprise et signalez clairement l’absence du transcript principal.

[Contrats, options et cas particuliers](../../behavior/extend/conversations/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
