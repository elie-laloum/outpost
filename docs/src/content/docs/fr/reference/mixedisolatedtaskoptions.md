---
title: "MixedIsolatedTaskOptions"
description: "MixedIsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MixedIsolatedTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                                                      | Présence  | Rôle                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| FileDispatchRequest<T> \| Promise<IsolatedTaskRequest<T> \| FileDispatchRequest<T>>` | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.       |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                          | Optionnel | Continuation de conversation native après pause de quota, sur option explicite, sans consommer de retry de tâche. |

## Signature

```ts
export interface MixedIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) =>
    | IsolatedTaskRequest<T>
    | FileDispatchRequest<T>
    | Promise<IsolatedTaskRequest<T> | FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Contrats associés

- [FileDispatchRequest](../filedispatchrequest/)
- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
