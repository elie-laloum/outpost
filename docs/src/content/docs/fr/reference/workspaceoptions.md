---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `guard`        | `DiffGuard \| undefined`                                 | Optionnel | Politique facultative du diff commité, détenue par ce workspace et réutilisée par chaque sandbox et agent. Exige named ou integrate ; current échoue avec le code configuration avant exécution. Les dispatchs et sessions de terminal réussis la vérifient après synchronisation ; integrate la revérifie sous le verrou de fusion. Un refus lève le code guard et conserve la branche et le worktree à la fermeture de ce workspace, même sans preserve. Les workspaces named comparent leur commit d’ouverture avec le commit courant au fil des exécutions ; les workspaces integrate comparent le candidat avec son unique ancêtre commun avec l’hôte, commits hérités compris. |
| `observation`  | `ObservationHub \| undefined`                            | Optionnel | Hub qui reçoit les opérations Git, de copie, de hook, d’intégration et de nettoyage de ce workspace. L’appelant en reste propriétaire ; le workspace ne le ferme jamais.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Admission de stockage vérifiée avant l’ouverture du workspace : réserve reserveBytes et échoue avec le code configuration si l’usage sous .outpost plus les réservations actives dépasseraient maxBytes. La réservation est libérée à la fermeture du workspace.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `signal`       | `AbortSignal \| undefined`                               | Optionnel | Annule l’ouverture : vérifié avant l’allocation et transmis à la réservation de stockage et aux commandes workspaceReady. Un workspace ouvert l’ignore.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `repository`   | `string \| undefined`                                    | Optionnel | Chemin dans le checkout Git hôte, par défaut le répertoire de travail du processus. Outpost travaille depuis le répertoire racine du checkout ; un répertoire indisponible échoue avec le code workspace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `branch`       | `BranchPolicy \| undefined`                              | Optionnel | Politique de branche : current, named ou integrate. { mode: "current" } par défaut ; createSandbox() et dispatch() sur un provider distant utilisent integrate par défaut.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `copies`       | `readonly string[] \| undefined`                         | Optionnel | Fichiers ou dossiers relatifs au dépôt, copiés depuis le checkout hôte dans le nouveau worktree avant workspaceReady ; les entrées absentes sont ignorées. Exige named ou integrate, et les chemins absolus, avec .. ou .git échouent avec le code configuration. Une copie non suivie ou ignorée fait conserver le worktree à la fermeture. Sur un provider distant sans includeUncommitted, une copie non ignorée par un .gitignore commité fait échouer la première synchronisation avec le code workspace.                                                                                                                                                                       |
| `limits`       | `StageLimits \| undefined`                               | Optionnel | Délais en millisecondes de copie, de préparation Git, de collecte des commits et d’intégration. Au-delà, l’étape échoue avec le code timeout, ou conflict pour l’intégration. collectMs borne aussi chaque commande Git d’inspection du garde-fou de diff ; une inspection incomplète échoue avec le code guard.                                                                                                                                                                                                                                                                                                                                                                     |
| `label`        | `string \| undefined`                                    | Optionnel | Nom utilisé dans la branche integrate (outpost/&lt;label>-&lt;id>), le dossier du worktree sous .outpost/workspaces et le journal d’échec au démarrage ; mis en minuscules, autres caractères remplacés par -, tronqué à 48.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation : workspaceReady une fois à l’ouverture du workspace, puis hostReady et sandboxReady pour chaque sandbox qui l’utilise, sauf si cette sandbox passe ses propres hooks. Chaque commande s’arrête après 600000 (10 minutes) sauf si elle fixe deadlineMs ; une sortie non nulle échoue avec le code process.                                                                                                                                                                                                                                                                                                                                                  |

## Signature

```ts
export interface WorkspaceOptions {
  readonly guard?: DiffGuard;
  readonly observation?: ObservationHub;
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}
```

## Contrats associés

- [BranchPolicy](../branchpolicy/)
- [DiffGuard](../diffguard/)
- [LifecycleHooks](../lifecyclehooks/)
- [ObservationHub](../observationhub/)
- [StageLimits](../stagelimits/)
- [StorageReservationOptions](../storagereservationoptions/)
