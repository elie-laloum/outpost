---
title: "McpStdioServer"
description: "McpStdioServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpStdioServer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`          | `string`                                        | Requis    | Exécutable lancé dans la sandbox. Texte littéral ; il ne peut pas contenir ${ ni NUL.                                                                                                                                                           |
| `arguments`        | `readonly string[] \| undefined`                | Optionnel | Arguments littéraux transmis à la commande, sans référence ${.                                                                                                                                                                                  |
| `environment`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Valeurs d’environnement non secrètes définies pour le serveur, écrites telles quelles dans la configuration.                                                                                                                                    |
| `variables`        | `readonly string[] \| undefined`                | Optionnel | Noms de variables déclarées transmises au serveur. Les valeurs n’apparaissent jamais dans les arguments ni dans les fichiers ; une variable manquante fait échouer avant le démarrage de l’agent.                                               |
| `tools`            | `McpToolFilter \| undefined`                    | Optionnel | Filtre d’outils par nom MCP exact. include ne garde que les outils listés et exclude en retire ensuite. Les harness qui ne savent pas appliquer une partie la refusent à la composition de l’agent.                                             |
| `startupTimeoutMs` | `number \| undefined`                           | Optionnel | Durée maximale en millisecondes du démarrage du serveur, de 1 à 2147483647. Le harness intégré utilise 60000 par défaut ; Codex et Kimi l’appliquent par serveur, Claude Code via un MCP_TIMEOUT commun, et Copilot et Antigravity la refusent. |

## Signature

```ts
export interface McpStdioServer {
  readonly command: string;
  readonly arguments?: readonly string[];
  readonly environment?: Readonly<Record<string, string>>;
  readonly variables?: readonly string[];
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}
```

## Contrats associés

- [McpToolFilter](../mcptoolfilter/)
