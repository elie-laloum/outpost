---
title: "AgentTaskOptions"
description: "AgentTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                                           | Présence | Rôle                                                                                              |
| --------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                      | Requis   | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas. |
| `request` | `(context: TaskContext) => DispatchOptions<T>` | Requis   | Construit les options de dispatch depuis les dépendances pour la sandbox existante.               |

## Signature

```ts
export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
};
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
