---
title: "McpPromptOptions"
description: "McpPromptOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpPromptOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                            | Présence  | Rôle                                                                                      |
| ----------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `server`    | `string`                                        | Requis    | Nom d’un serveur MCP déclaré sur le même harness et qui propose des prompts.              |
| `name`      | `string`                                        | Requis    | Nom du prompt tel que listé par le serveur.                                               |
| `arguments` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Arguments texte du prompt, aucun par défaut ; les valeurs sont transmises telles quelles. |

## Signature

```ts
export interface McpPromptOptions {
  readonly server: string;
  readonly name: string;
  readonly arguments?: Readonly<Record<string, string>>;
}
```
