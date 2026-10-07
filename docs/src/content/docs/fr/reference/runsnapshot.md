---
title: "RunSnapshot"
description: "RunSnapshot — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunSnapshot } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                         | Présence  | Rôle                                                                                                                           |
| ---------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `version`        | `1`                          | Requis    | Version du schéma de projection stocké, actuellement 1.                                                                        |
| `id`             | `string`                     | Requis    | ID de recherche choisi par l’application, indépendant de l’identité d’exécution du workflow.                                   |
| `kind`           | `"workflow" \| "dispatch"`   | Requis    | Un dispatch autonome ou un workflow contenant des dispatchs de tâches.                                                         |
| `executionId`    | `string \| undefined`        | Optionnel | Identité d’exécution du workflow obtenue au démarrage et vérifiée aux reprises.                                                |
| `workflow`       | `string \| undefined`        | Optionnel | Nom déclaré du workflow issu de ses événements de cycle de vie.                                                                |
| `status`         | `RunStatus`                  | Requis    | Cycle de vie observé ; un heartbeat expiré d’une exécution en cours renvoie abandoned présumé.                                 |
| `seq`            | `number`                     | Requis    | Dernier curseur d’événement persistant publié ; watchRun commence strictement après lui.                                       |
| `observationSeq` | `number`                     | Requis    | Dernière séquence du hub livrée, réinitialisée avec un nouveau hub à la reprise.                                               |
| `complete`       | `boolean`                    | Requis    | False pour un trou détecté de séquence du hub ou un heartbeat expiré. True ne prouve pas l’absence d’événements finaux perdus. |
| `startedAt`      | `string`                     | Requis    | Heure de création du premier récepteur, conservée à la reprise.                                                                |
| `updatedAt`      | `string`                     | Requis    | Heure de la dernière observation publiée ; les seuls heartbeats ne la modifient pas.                                           |
| `heartbeatAt`    | `string`                     | Requis    | Heure du dernier heartbeat publié avec succès, selon l’horloge de l’écrivain.                                                  |
| `expiresAt`      | `string`                     | Requis    | Heure d’expiration du heartbeat ; les lecteurs déduisent abandoned uniquement pour les fiches en cours.                        |
| `tasks`          | `readonly RunTask[]`         | Requis    | États des tâches déclarées renseignés au démarrage et actualisés à la fin ou reprise du workflow.                              |
| `dispatches`     | `readonly RunDispatch[]`     | Requis    | Historique des dispatchs observés par identité, tâche et tentative.                                                            |
| `commits`        | `readonly Commit[]`          | Requis    | Commits des dispatchs observés, dédupliqués par identifiant d’objet.                                                           |
| `usage`          | `Usage`                      | Requis    | Tokens cumulés du workflow ou du dispatch autonome ; les rapports imbriqués ne sont pas ajoutés deux fois.                     |
| `accounting`     | `WorkflowUsage \| undefined` | Optionnel | Fiche du budget du workflow avec tentatives, tokens cumulés et estimation monétaire optionnelle.                               |
| `errors`         | `readonly RunError[]`        | Requis    | Messages d’erreur observés des tâches, workflows et dispatchs classés.                                                         |

## Signature

```ts
export interface RunSnapshot {
  readonly version: 1;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly executionId?: string;
  readonly workflow?: string;
  readonly status: RunStatus;
  readonly seq: number;
  readonly observationSeq: number;
  readonly complete: boolean;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly heartbeatAt: string;
  readonly expiresAt: string;
  readonly tasks: readonly RunTask[];
  readonly dispatches: readonly RunDispatch[];
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly accounting?: WorkflowUsage;
  readonly errors: readonly RunError[];
}
```

## Contrats associés

- [Commit](../commit/)
- [RunDispatch](../rundispatch/)
- [RunError](../runerror/)
- [RunStatus](../runstatus/)
- [RunTask](../runtask/)
- [Usage](../usage/)
- [WorkflowUsage](../workflowusage/)
