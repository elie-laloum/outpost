---
title: "FileAgentTaskOptions"
description: "FileAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileAgentTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                           | Présence  | Rôle                                                                                                              |
| ------------- | ---------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optionnel | Continuation de conversation native après pause de quota, sur option explicite, sans consommer de retry de tâche. |
| `sandbox`     | `FileSandbox`                                  | Requis    | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                   |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.       |

## Signature

```ts
export interface FileAgentTaskOptions<T> {
  readonly quotaResume?: QuotaResumePolicy;
  readonly sandbox: FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
}
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [FileSandbox](../filesandbox/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
