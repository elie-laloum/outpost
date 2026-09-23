---
title: "Campagnes d’issues"
description: "Campagnes d’issues — Outpost"
sidebar:
  order: 4
---

Une campagne recharge les issues prêtes, planifie les branches, implémente et relit chaque issue, puis intègre le travail avant de fermer les éléments du tracker.

```ts
import { campaign, codex, claude, githubBacklog } from "@elie-laloum/outpost";

const result = await campaign({
  agent: codex(),
  planner: claude(),
  reviewer: claude(),
  merger: codex(),
  backlog: githubBacklog({ label: "outpost-ready" }),
  cycles: 10,
  concurrency: 3,
  implementationPasses: 100,
  reviewPasses: 1,
  standards: "Respecte les conventions, teste et commite chaque changement.",
  observe: (event) => console.log(event.phase, event.cycle, event.issue),
});
console.log(result.reason, result.issues);
```

## Rôles et limites

`agent` et `backlog` sont obligatoires. Les autres rôles utilisent les défauts de la campagne lorsqu’ils sont omis. `planner: false` prend les issues prêtes dans l’ordre ; `reviewer: false` désactive la revue. Les limites par défaut sont 10 cycles, une concurrence de 3, 100 passes d’implémentation et 1 passe de revue. Ce sont des entiers positifs. Les options habituelles de sandbox restent disponibles ; la campagne possède l’allocation des branches et workspaces.

Le planificateur retourne des affectations uniques avec des identifiants connus et des noms de nouvelles branches valides. Un plan invalide échoue avant l’implémentation. Chaque issue possède un workspace nommé et une sandbox réutilisable ; la revue examine tout le diff depuis la base du cycle. Une issue sans commit est marquée `empty` et n’est pas fermée.

## Intégration et résultats

Les branches terminées entrent dans une sandbox d’intégration distincte, même pour une seule issue. L’agent de fusion résout les conflits et valide l’ensemble. Outpost vérifie que les commits d’issue sont ancêtres du résultat et qu’aucun changement non commité ne reste. Les issues ne ferment qu’après intégration sur l’hôte.

Un échec d’issue est enregistré pendant que les autres continuent. Un échec de fusion conserve le workspace. Un échec de fermeture du tracker survient après intégration : réconciliez le tracker avant de relancer pour éviter de refaire le travail fusionné.

`reason` vaut `empty`, `blocked`, `no-progress` ou `limit`. Chaque issue est `empty`, `failed` ou `merged`, avec identifiant, branche et erreur éventuelle. L’annulation rejette l’opération. Les phases sont `backlog`, `plan`, `implement`, `review`, `merge` et `close`.
