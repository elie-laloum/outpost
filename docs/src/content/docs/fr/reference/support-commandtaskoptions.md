---
title: "CommandTaskOptions"
description: "CommandTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                                             | Présence | Rôle                                                                                              |
| --------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                        | Requis   | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas. |
| `command` | `Command \| ((context: TaskContext) => Command)` | Requis   | Commande à exécuter, ou fabrique la construisant depuis les valeurs des dépendances.              |

## Signature

```ts
export type CommandTaskOptions = {
  sandbox: Sandbox;
  command: Command | ((context: TaskContext) => Command);
};
```

## Contrats associés

- [Command](../command/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
