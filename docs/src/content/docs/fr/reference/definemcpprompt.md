---
title: "defineMcpPrompt"
description: "defineMcpPrompt — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineMcpPrompt } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare des instructions de harness rendues à partir d’un prompt d’un serveur MCP déclaré, au début de chaque tour. La construction valide le nom du serveur, le nom du prompt et les arguments texte sans contacter le serveur ; la résolution échoue si le harness n’a pas de serveur démarré de ce nom ou si le serveur ne propose pas de prompts.

[Exemple complet et règles détaillées](../../guide/harness/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                         |
| ------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `options`           | `McpPromptOptions`                              | Requis    | Serveur, nom et arguments texte du prompt à rendre.                          |
| `options.server`    | `string`                                        | Requis    | Nom d’un serveur MCP déclaré sur le même harness et qui propose des prompts. |
| `options.name`      | `string`                                        | Requis    | Nom du prompt tel que listé par le serveur.                                  |
| `options.arguments` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Arguments texte du prompt ; les valeurs sont transmises telles quelles.      |

## Retour

`HarnessInstructions`

## Signature

```ts
export declare function defineMcpPrompt(
  options: McpPromptOptions,
): HarnessInstructions;
```

## Contrats associés

- [HarnessInstructions](../harnessinstructions/)
- [McpPromptOptions](../mcppromptoptions/)
