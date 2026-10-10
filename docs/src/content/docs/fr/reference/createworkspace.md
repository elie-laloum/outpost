---
title: "createWorkspace"
description: "createWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un workspace possédé Git, dossier copié, dossier monté ou éphémère. Les modes de fichiers n’allouent aucun dépôt Git et ne publient rien à leur fermeture.

[Exemple complet et règles détaillées](../../guide/working-with-files/).

## Paramètres et propriétés

### Variante 1 — `GitWorkspaceOptions`

| Nom                    | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | -------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `GitWorkspaceOptions`                                    | Requis    | Choisit la branche Git ou la source de fichiers, le répertoire de contrôle et la politique de propriété du workspace.                                                                                                                                                                                                               |
| `options.source`       | `GitWorkspaceSource`                                     | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                                                                                                                                                                                                                         |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation : workspaceReady une fois à l’ouverture du workspace, puis hostReady et sandboxReady pour chaque sandbox qui l’utilise, sauf si cette sandbox passe ses propres hooks. Chaque commande s’arrête après 600000 (10 minutes) sauf si elle fixe deadlineMs ; une sortie non nulle échoue avec le code process. |
| `options.signal`       | `AbortSignal \| undefined`                               | Optionnel | Annule l’ouverture : vérifié avant l’allocation et transmis à la réservation de stockage et aux commandes workspaceReady. Un workspace ouvert l’ignore.                                                                                                                                                                             |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Admission de stockage vérifiée avant l’ouverture du workspace : réserve reserveBytes et échoue avec le code configuration si l’usage sous .outpost plus les réservations actives dépasseraient maxBytes. La réservation est libérée à la fermeture du workspace.                                                                    |
| `options.observation`  | `ObservationHub \| undefined`                            | Optionnel | Hub qui reçoit les opérations Git, de copie, de hook, d’intégration et de nettoyage de ce workspace. L’appelant en reste propriétaire ; le workspace ne le ferme jamais.                                                                                                                                                            |
| `options.limits`       | `StageLimits \| undefined`                               | Optionnel | Délais en millisecondes de copie, de préparation Git, de collecte des commits et d’intégration. Au-delà, l’étape échoue avec le code timeout, ou conflict pour l’intégration. collectMs borne aussi chaque commande Git d’inspection du garde-fou de diff ; une inspection incomplète échoue avec le code guard.                    |
| `options.label`        | `string \| undefined`                                    | Optionnel | Nom utilisé dans la branche integrate (outpost/&lt;label>-&lt;id>), le dossier du worktree sous .outpost/workspaces et le journal d’échec au démarrage ; mis en minuscules, autres caractères remplacés par -, tronqué à 48.                                                                                                        |

### Variante 2 — `FileWorkspaceOptions`

| Nom                    | Type                                                     | Présence  | Rôle                                                                                                                              |
| ---------------------- | -------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `FileWorkspaceOptions`                                   | Requis    | Choisit la branche Git ou la source de fichiers, le répertoire de contrôle et la politique de propriété du workspace.             |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                     |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Réservation d’admission via Transport ; coordonne les writers coopérants sans imposer de quota physique de disque.                |
| `options.recovery`     | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow. |
| `options.inputs`       | `readonly WorkspaceInput[] \| undefined`                 | Optionnel | Entrées de fichiers explicites ; les paramètres JSON du workflow ne sont jamais écrits implicitement sur disque.                  |
| `options.source`       | `FileWorkspaceSource`                                    | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                       |
| `options.runtime`      | `WorkspaceRuntimeOptions \| undefined`                   | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                   |
| `options.paths`        | `readonly string[] \| undefined`                         | Optionnel | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                          |
| `options.retention`    | `WorkspaceRetention \| undefined`                        | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.         |
| `options.signal`       | `AbortSignal \| undefined`                               | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.        |

## Retour

`Promise<GitWorkspace>` · `Promise<FileWorkspace>`

## Signature

```ts
export declare function createWorkspace(
  options: GitWorkspaceOptions,
): Promise<GitWorkspace>;

export declare function createWorkspace(
  options: FileWorkspaceOptions,
): Promise<FileWorkspace>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceOptions](../fileworkspaceoptions/)
- [GitWorkspace](../gitworkspace/)
- [GitWorkspaceOptions](../gitworkspaceoptions/)
