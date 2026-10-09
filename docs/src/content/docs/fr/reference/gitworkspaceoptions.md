---
title: "GitWorkspaceOptions"
description: "GitWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitWorkspaceOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`       | `GitWorkspaceSource`                                     | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                                                                                                                                                                                                                         |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation : workspaceReady une fois à l’ouverture du workspace, puis hostReady et sandboxReady pour chaque sandbox qui l’utilise, sauf si cette sandbox passe ses propres hooks. Chaque commande s’arrête après 600000 (10 minutes) sauf si elle fixe deadlineMs ; une sortie non nulle échoue avec le code process. |
| `signal`       | `AbortSignal \| undefined`                               | Optionnel | Annule l’ouverture : vérifié avant l’allocation et transmis à la réservation de stockage et aux commandes workspaceReady. Un workspace ouvert l’ignore.                                                                                                                                                                             |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Admission de stockage vérifiée avant l’ouverture du workspace : réserve reserveBytes et échoue avec le code configuration si l’usage sous .outpost plus les réservations actives dépasseraient maxBytes. La réservation est libérée à la fermeture du workspace.                                                                    |
| `observation`  | `ObservationHub \| undefined`                            | Optionnel | Hub qui reçoit les opérations Git, de copie, de hook, d’intégration et de nettoyage de ce workspace. L’appelant en reste propriétaire ; le workspace ne le ferme jamais.                                                                                                                                                            |
| `limits`       | `StageLimits \| undefined`                               | Optionnel | Délais en millisecondes de copie, de préparation Git, de collecte des commits et d’intégration. Au-delà, l’étape échoue avec le code timeout, ou conflict pour l’intégration. collectMs borne aussi chaque commande Git d’inspection du garde-fou de diff ; une inspection incomplète échoue avec le code guard.                    |
| `label`        | `string \| undefined`                                    | Optionnel | Nom utilisé dans la branche integrate (outpost/&lt;label>-&lt;id>), le dossier du worktree sous .outpost/workspaces et le journal d’échec au démarrage ; mis en minuscules, autres caractères remplacés par -, tronqué à 48.                                                                                                        |

## Signature

```ts
export interface GitWorkspaceOptions extends Omit<
  WorkspaceOptions,
  "repository" | "branch" | "copies" | "guard"
> {
  readonly source: GitWorkspaceSource;
}
```

## Contrats associés

- [GitWorkspaceSource](../gitworkspacesource/)
- [WorkspaceOptions](../workspaceoptions/)
