---
title: "Choisir ce qui tourne, indépendamment du lieu"
description: "Construisez des configurations d’agents sans allouer une sandbox ni appeler un modèle."
---

Construisez des configurations d’agents sans allouer une sandbox ni appeler un modèle.

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
import { claude, codex, gemini, agentVersions } from "@elie-laloum/outpost";

const agents = [codex(), claude(), gemini()];
assert.deepEqual(
  agents.map((agent) => agent.name),
  ["codex", "claude", "gemini"],
);
console.log(agents.map((agent) => agent.name));
console.log(agentVersions);
```

```sh
node example.mts
```

## Comprendre le résultat

Les adapters choisissent le comportement de la CLI native. Les providers choisissent l’environnement. Construire un adapter ne l’authentifie pas et n’appelle pas de modèle. Passez-le au dispatch et changez indépendamment le provider. Sans modèle explicite, la CLI utilise son défaut. Gemini prend en charge les nouvelles sessions ; Claude et Codex permettent capture et reprise natives.

[Contrats, options et cas particuliers](../../../reference/behavior/agents/adapters/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
