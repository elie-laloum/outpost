---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                                     | Présence  | Rôle                                                                                                                              |
| ----------------- | -------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `signal`          | `AbortSignal`                                            | Requis    | Annulation coopérative de cette opération.                                                                                        |
| `attempt`         | `number`                                                 | Requis    | Numéro de tentative de tâche commençant à un.                                                                                     |
| `executionId`     | `string`                                                 | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                |
| `reportUsage`     | `(usage: Usage) => void`                                 | Requis    | Ajoute l’usage de tokens observé pendant cette tentative à la comptabilité cumulée du workflow.                                   |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optionnel | Ajoute l’usage de tokens seulement si l’identifiant de reçu n’a pas déjà été enregistré, y compris après reprise d’un checkpoint. |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optionnel | Persiste l’état courant du workflow lorsque l’exécution durable est activée.                                                      |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Requis    | Lit la sortie terminée d’une tâche figurant dans les dépendances déclarées de cette tâche.                                        |

## Signature

```ts
export interface TaskContext {
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}
```

## Contrats associés

- [Task](../type-task/)
- [Usage](../usage/)
