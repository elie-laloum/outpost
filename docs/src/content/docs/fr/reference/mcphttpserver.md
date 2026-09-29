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

| Nom                   | Type                                            | Présence  | Rôle                                                                                                                         |
| --------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `url`                 | `string`                                        | Requis    | URL http ou https absolue d’un point d’accès MCP Streamable HTTP, sans identifiants intégrés.                                |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Optionnel | En-têtes HTTP non secrets envoyés avec chaque requête. Utilisez bearerTokenVariable pour un jeton Authorization.             |
| `bearerTokenVariable` | `string \| undefined`                           | Optionnel | Nom d’une variable déclarée dont la valeur est envoyée en Authorization: Bearer. Incompatible avec un en-tête Authorization. |

## Signature

```ts
export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
}
```
