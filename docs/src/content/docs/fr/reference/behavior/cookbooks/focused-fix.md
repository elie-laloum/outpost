---
title: "Un correctif ciblé sur sa branche"
description: "Un correctif ciblé sur sa branche — Outpost"
sidebar:
  order: 1
---

Utilisez cette recette pour un défaut bien délimité. Prérequis : [installation commune](../../../../guide/cookbook/), connexion Claude et projet npm avec lockfile et tests. Adaptez le nom de branche et la description.

```ts
import { dispatch, claude } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: claude(),
  branch: { mode: "named", name: "fix/input-validation" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
  brief: {
    text: "Handle empty input in the parser. Add a regression test, run npm test, commit the fix, then write <outpost>done</outpost>.",
  },
  deadlineMs: 600_000,
  idleMs: 120_000,
});
console.log({
  completed: result.completed,
  branch: result.branch,
  commits: result.commits,
  transcript: result.transcript,
});
if (!result.completed)
  throw new Error("The completion marker was not returned");
```

## Résultat attendu

Le résultat indique la branche et les commits. Inspectez **git diff HEAD...fix/input-validation** et relancez les contrôles avant fusion. Le marqueur de fin est une déclaration de l'agent, pas une preuve de réussite des tests. La branche nommée n'est pas fusionnée automatiquement.

## Échec et répétition

Un processus ou hook en échec fait échouer le dispatch. Le travail non commité est conservé pour la [récupération](../../../../guide/cookbook/recovery/). Réutiliser la branche reprend son historique ; choisissez un autre nom pour une tentative indépendante.
