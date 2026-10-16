---
title: "HookCommand"
description: "HookCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HookCommand } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                            | Présence  | Rôle                                                                           |
| ------------ | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `executable` | `string`                                        | Requis    | Programme à exécuter dans le sandbox, sans expansion shell implicite.          |
| `arguments`  | `readonly string[] \| undefined`                | Optionnel | Arguments littéraux du programme.                                              |
| `directory`  | `string \| undefined`                           | Optionnel | Répertoire de travail dans le sandbox ; celui du contexte appelant par défaut. |
| `variables`  | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement explicites de la commande du hook.                   |

## Signature

```ts
export interface HookCommand {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly directory?: string;
  readonly variables?: Variables;
}
```

## Contrats associés

- [Variables](../variables/)
