---
title: "Implémenter un adapter d’agent"
description: "Exécutez l’exemple complet, puis examinez sa sortie et comparez-la au contrat détaillé."
---

Exécutez l’exemple complet, puis examinez sa sortie et comparez-la au contrat détaillé.

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
import type { AgentAdapter } from "@elie-laloum/outpost";

const adapter: AgentAdapter = {
  name: "example",
  resumable: false,
  capture: false,
  request(input) {
    if (input.continuation) throw new Error("Continuation is unsupported");
    return {
      executable: "example-agent",
      arguments: ["run", input.text ?? ""],
    };
  },
  events(line) {
    return [{ kind: "text", text: line }];
  },
};
console.log(adapter.name);
```

```sh
node example.mts
```

## Comprendre le résultat

L’exemple possède ses ressources. Gardez les protocoles fournisseurs dans un adapter et les erreurs d’observateurs séparées des résultats de tâches.

[Contrats, options et cas particuliers](../../behavior/extend/agents/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
