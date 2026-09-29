---
title: "Récupération et rétention — Vue d’ensemble"
description: "Planifiez et nettoyez les données Outpost conservées selon une politique, contrôlez le stockage face à une limite et vérifiez les transferts."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Ce qu’un plan peut supprimer

`planRecoveryRetention()` liste chaque entrée de `.outpost`, ou d’un transport, et la marque éligible ou conservée avec un code de motif. Une entrée n’est éligible que si tout l’inventaire est complet.

| Données                                                                                  | Éligible quand                                                                                                                                                                                                      | Motif si conservée                                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Worktrees de `.outpost/workspaces` (en local seulement)                                  | Périmètre `clean-workspaces` ; enregistré, sur une branche, sans modification ni fichier non suivi ou ignoré, sans verrou Git, verrou d’opération ni activité de ressource enregistrée ; plus ancien que `minAgeMs` | `SCOPE_NOT_SELECTED`, `DIRTY_WORKSPACE`, `DETACHED_WORKSPACE`, `RETENTION_AGE`, … |
| Journaux                                                                                 | Périmètre `closed-logs` ; l’index indique que le journal est fermé ; index et chaque segment plus anciens que `minAgeMs`                                                                                            | `LOG_ACTIVITY_OR_CONTENT_UNKNOWN`, `RETENTION_AGE_OR_INCOMPLETE_INVENTORY`        |
| Entrées du cache de tâches                                                               | Périmètre `task-cache` ; plus anciennes que `minAgeMs`                                                                                                                                                              | `TASK_CACHE_NOT_SELECTED`, `RETENTION_AGE_OR_INCOMPLETE_INVENTORY`                |
| Transferts de récupération, checkpoints, artefacts, conversations, réservations, verrous | Jamais                                                                                                                                                                                                              | `RECOVERY_DATA_PROTECTED`, `OWNERSHIP_RECORD_PROTECTED`                           |
| Toute entrée d’un inventaire incomplet                                                   | Jamais                                                                                                                                                                                                              | `INCOMPLETE_INVENTORY` ; `quota` vaut `unknown`                                   |

:::note
`maxBytes` et `maxWorkspaces` ne rendent jamais d’autres entrées éligibles. Ils font seulement passer `quota` à `exceeded` quand `projectedBytes` ou les worktrees restants après nettoyage les dépassent.
:::

## Ce que renvoie chaque appel

| Appel                                   | Résultat                                                                                            | Rejette                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `planRecoveryRetention(options)`        | Un plan avec ses entrées, `usageBytes`, `projectedBytes` et `quota` ; ne supprime rien              | Code `configuration` pour une politique invalide, ou `clean-workspaces`/`maxWorkspaces` avec un `transporter` |
| `pruneRecoveryRetention(plan, options)` | `removed`, `retained` (`PLAN_CHANGED`, `REVALIDATION_OR_REMOVAL_FAILED`) et un nouveau plan `after` | Code `configuration` pour un plan incomplet ou un `transporter` qui ne correspond pas au `source` du plan     |
| `assertRecoveryQuota(options)`          | Se résout quand l’usage observé plus `reserveBytes` tient dans `maxBytes` ; ne réserve rien         | Code `workspace` au-delà de la limite ou si l’inventaire est incomplet                                        |
| `verifyRecoveryTransfer(path, options)` | Contrôles par fichier, `complete` et `integrity` ; les contrôles échoués sont signalés, pas levés   | Code `configuration` pour `restorability` sans `repository` ; `workspace` pour un dossier absent              |

Le nettoyage revérifie chaque candidat contre un nouveau plan, supprime un worktree sous le verrou de sa branche en conservant la branche, et efface les objets de journal et de cache par écritures conditionnelles.

## Points d’entrée

Guide : [Récupérer du travail](../../../guide/recovery/) · [Rétention et nettoyage](../../../guide/retention/)

- [planRecoveryRetention](../../planrecoveryretention/)
- [pruneRecoveryRetention](../../prunerecoveryretention/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [verifyRecoveryTransfer](../../verifyrecoverytransfer/)
- [RecoveryRetentionPolicy](../../recoveryretentionpolicy/)
- [RecoveryRetentionPlan](../../recoveryretentionplan/)
- [RecoveryRetentionEntry](../../recoveryretentionentry/)
- [RecoveryPruneResult](../../recoverypruneresult/)
- [RecoveryQuotaOptions](../../recoveryquotaoptions/)
- [RecoveryVerification](../../recoveryverification/)
