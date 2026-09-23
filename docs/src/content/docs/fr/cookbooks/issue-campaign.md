---
title: "Une campagne d’issues bornée"
description: "Une campagne d’issues bornée — Outpost"
sidebar:
  order: 6
---

Utilisez cette recette pour demander implémentation, intégration et fermeture d’issues pilotées par un tracker. Prérequis : connexion Claude, remote GitHub, authentification de **gh** sur l’hôte et branche d’intégration propre. Commencez par une petite issue avec le label **outpost-ready**. Vérifiez **gh auth status**.

```ts
import { campaign, claude, githubBacklog } from "@elie-laloum/outpost";

const result = await campaign({
  agent: claude(),
  planner: false,
  reviewer: claude(),
  merger: claude(),
  backlog: githubBacklog({ label: "outpost-ready" }),
  cycles: 1,
  concurrency: 1,
  implementationPasses: 2,
  reviewPasses: 1,
  signal: AbortSignal.timeout(1_800_000),
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
  standards:
    "Implement only the assigned issue, add regression tests, run npm test and commit. During integration run the full suite again.",
  observe: (event) => console.log(event.phase, event.issue),
});
console.log(result.reason, result.issues);
```

## Commencer petit

Un cycle et un worker rendent le premier essai facile à examiner. **planner: false** utilise l’ordre des issues prêtes. Relecteur et intégrateur restent des rôles séparés. Augmentez la concurrence après observation de l’indépendance des branches, quotas et ressources.

## Effets externes

Les commits sont intégrés localement avant fermeture de l’issue sur GitHub. La recette ne pousse pas la branche. Une implémentation vide ne ferme pas l’issue. Un échec du tracker après intégration exige une réconciliation avant relance pour éviter les doublons. Voir les [résultats de campagne](../../workflows/campaigns/). Les identifiants du tracker sont distincts de ceux du modèle.
