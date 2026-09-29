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

Déclare des instructions rendues au début de chaque tour à partir d’un prompt d’un serveur MCP déclaré sur le même harness. La construction vérifie le nom du serveur, le nom du prompt et les arguments texte sans contacter le serveur ; le tour échoue avec le code configuration si ce serveur ne tourne pas ou n’offre aucun prompt.

[Exemple complet et règles détaillées](../../guide/mcp-servers/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                      |
| ------------------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `options`           | `McpPromptOptions`                              | Requis    | Serveur, nom et arguments texte du prompt à rendre.                                       |
| `options.server`    | `string`                                        | Requis    | Nom d’un serveur MCP déclaré sur le même harness et qui propose des prompts.              |
| `options.name`      | `string`                                        | Requis    | Nom du prompt tel que listé par le serveur.                                               |
| `options.arguments` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Arguments texte du prompt, aucun par défaut ; les valeurs sont transmises telles quelles. |

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
