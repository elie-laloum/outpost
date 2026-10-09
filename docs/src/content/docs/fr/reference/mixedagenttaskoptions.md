---
title: "MixedAgentTaskOptions"
description: "MixedAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MixedAgentTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                           | Présence  | Rôle                                                                                                              |
| ------------- | ---------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `sandbox`     | `FileSandbox \| Sandbox`                       | Requis    | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                   |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.       |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optionnel | Continuation de conversation native après pause de quota, sur option explicite, sans consommer de retry de tâche. |

## Signature

```ts
export interface MixedAgentTaskOptions<T> {
  readonly sandbox: Sandbox | FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [FileSandbox](../filesandbox/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
