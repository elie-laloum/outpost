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

| Nom                   | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                 | `string`                                        | Requis    | URL http ou https absolue d’un point d’accès MCP Streamable HTTP, sans identifiants intégrés.                                                                                                                                                                                               |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Optionnel | En-têtes HTTP non secrets envoyés avec chaque requête. Utilisez bearerTokenVariable pour un jeton Authorization.                                                                                                                                                                            |
| `bearerTokenVariable` | `string \| undefined`                           | Optionnel | Nom d’une variable déclarée dont la valeur est envoyée en Authorization: Bearer. Incompatible avec un en-tête Authorization.                                                                                                                                                                |
| `oauth`               | `"login" \| McpClientCredentials \| undefined`  | Optionnel | "login" copie la connexion OAuth MCP que Claude Code, Codex ou Kimi ont enregistrée sur l’hôte ; les identifiants client fonctionnent uniquement dans le harness intégré, qui demande le jeton depuis la sandbox. Exclut bearerTokenVariable et un en-tête Authorization.                   |
| `tools`               | `McpToolFilter \| undefined`                    | Optionnel | Filtre d’outils par nom MCP exact. include ne garde que les outils listés et exclude en retire ensuite. Les harness qui ne savent pas appliquer une partie la refusent à la composition de l’agent.                                                                                         |
| `startupTimeoutMs`    | `number \| undefined`                           | Optionnel | Délai de démarrage du serveur en millisecondes, de 1 à 2147483647 ; 60000 par défaut dans le harness intégré. Codex et Kimi l’appliquent par serveur, Claude Code via un seul MCP_TIMEOUT qui doit être identique sur chaque serveur qui le définit, et Copilot et Antigravity le refusent. |

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
