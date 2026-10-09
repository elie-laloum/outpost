---
title: "FileIsolatedTaskOptions"
description: "FileIsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileIsolatedTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                  | Présence  | Rôle                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `request`     | `(context: TaskContext) => FileDispatchRequest<T> \| Promise<FileDispatchRequest<T>>` | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.       |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optionnel | Continuation de conversation native après pause de quota, sur option explicite, sans consommer de retry de tâche. |

## Signature

```ts
export interface FileIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) => FileDispatchRequest<T> | Promise<FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Contrats associés

- [FileDispatchRequest](../filedispatchrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
