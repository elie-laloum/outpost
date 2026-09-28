---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom           | Type                                                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Requis    | Construit les options de dépôt, provider, agent et brief pour un dispatch alloué séparément à chaque tentative.                                                                                                                                                                                       |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optionnel | Après une pause sur quota, poursuit la conversation capturée dans le nouveau dispatch (continue, par défaut) ou en démarre une nouvelle (restart). Les workspaces intégrés automatiquement partent alors de la branche interrompue ; les changements non commités restent dans son worktree conservé. |

## Signature

```ts
export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};
```

## Contrats associés

- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
