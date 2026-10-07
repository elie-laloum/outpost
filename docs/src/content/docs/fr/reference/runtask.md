---
title: "RunTask"
description: "RunTask — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunTask } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                  |
| ------------ | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`        | `string`              | Requis    | Clé déclarée de la tâche, y compris avant son démarrage.                                                                                                                                                                                                                              |
| `status`     | `TaskStatus`          | Requis    | Dernier état de cycle de vie observé de la tâche.                                                                                                                                                                                                                                     |
| `attempts`   | `number`              | Requis    | Tentatives cumulées signalées par le workflow, conservées aux reprises.                                                                                                                                                                                                               |
| `usage`      | `Usage`               | Requis    | Tokens signalés via le contexte de workflow de cette tâche pendant l’observation ; conservés à la reprise de la même projection. Les tâches restaurées sans compteurs précédemment observés portent complete false. Les compteurs des dispatchs ne sont pas ajoutés une seconde fois. |
| `startedAt`  | `string \| undefined` | Optionnel | Heure de début de la tâche depuis les observations ou fiches du workflow.                                                                                                                                                                                                             |
| `finishedAt` | `string \| undefined` | Optionnel | Dernière heure de fin ou suspension de la tâche depuis les observations ou fiches du workflow.                                                                                                                                                                                        |
| `error`      | `string \| undefined` | Optionnel | Dernier message d’erreur enregistré pour la tâche, filtré par le masquage du hub.                                                                                                                                                                                                     |

## Signature

```ts
export interface RunTask {
  readonly key: string;
  readonly status: TaskStatus;
  readonly attempts: number;
  readonly usage: Usage;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly error?: string;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
