---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ToolResources } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                             | Présence  | Rôle                                                                                                                                                                                                                                                                   |
| ----------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paths`     | `readonly string[] \| undefined` | Optionnel | Chemins relatifs au dépôt que l’appel lit ou écrit.                                                                                                                                                                                                                    |
| `command`   | `string \| undefined`            | Optionnel | Ligne de commande exécutée par l’appel, pour les règles de permission sur les commandes.                                                                                                                                                                               |
| `mcpServer` | `string \| undefined`            | Optionnel | Serveur MCP déclaré sélectionné par un outil de ressource ou de prompt. Les permissions des profils intégrés vérifient ce nom, y compris les profils parents hérités ; ce champ n’accorde aucun accès par lui-même et n’ajoute aucune règle de permission déclarative. |

## Signature

```ts
export interface ToolResources {
  readonly paths?: readonly string[];
  readonly command?: string;
  readonly mcpServer?: string;
}
```
