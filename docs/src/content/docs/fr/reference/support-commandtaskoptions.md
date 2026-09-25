---
title: "CommandTaskOptions"
description: "CommandTaskOptions — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom       | Type                                             | Présence | Rôle                                                                             |
| --------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                        | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `command` | `Command \| ((context: TaskContext) => Command)` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
