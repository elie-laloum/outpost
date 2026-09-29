---
title: "McpHttpServer"
description: "McpHttpServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpHttpServer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                |
| --------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                 | `string`                                        | Requis    | URL http ou https absolue d’un point d’accès MCP Streamable HTTP, sans identifiants intégrés.                                                                                                                                                       |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Optionnel | En-têtes HTTP non secrets envoyés avec chaque requête. Utilisez bearerTokenVariable pour un jeton Authorization.                                                                                                                                    |
| `bearerTokenVariable` | `string \| undefined`                           | Optionnel | Nom d’une variable déclarée dont la valeur est envoyée en Authorization: Bearer. Incompatible avec un en-tête Authorization.                                                                                                                        |
| `oauth`               | `"login" \| McpClientCredentials \| undefined`  | Optionnel | "login" réutilise la connexion OAuth MCP enregistrée sur l’hôte par Claude Code, Codex ou Kimi ; les identifiants client laissent le harness intégré demander lui-même un jeton. Incompatible avec bearerTokenVariable et un en-tête Authorization. |
| `tools`               | `McpToolFilter \| undefined`                    | Optionnel | Filtre d’outils par nom MCP exact. include ne garde que les outils listés et exclude en retire ensuite. Les harness qui ne savent pas appliquer une partie la refusent à la composition de l’agent.                                                 |
| `startupTimeoutMs`    | `number \| undefined`                           | Optionnel | Durée maximale en millisecondes du démarrage du serveur, de 1 à 2147483647. Le harness intégré utilise 60000 par défaut ; Codex et Kimi l’appliquent par serveur, Claude Code via un MCP_TIMEOUT commun, et Copilot et Antigravity la refusent.     |

## Signature

```ts
export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
  readonly oauth?: "login" | McpClientCredentials;
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}
```

## Contrats associés

- [McpClientCredentials](../mcpclientcredentials/)
- [McpToolFilter](../mcptoolfilter/)
