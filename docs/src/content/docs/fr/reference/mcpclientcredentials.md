---
title: "McpClientCredentials"
description: "McpClientCredentials — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpClientCredentials } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                    | Type                             | Présence  | Rôle                                                                                                                          |
| ---------------------- | -------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `clientIdVariable`     | `string`                         | Requis    | Variable déclarée contenant l’identifiant du client OAuth.                                                                    |
| `clientSecretVariable` | `string`                         | Requis    | Variable déclarée contenant le secret du client OAuth, envoyé en client_secret_basic ou client_secret_post depuis la sandbox. |
| `scopes`               | `readonly string[] \| undefined` | Optionnel | Scopes OAuth demandés avec le jeton. Sans eux, le pont utilise le scope du défi 401 du serveur, s’il y en a un.               |

## Signature

```ts
export interface McpClientCredentials {
  readonly clientIdVariable: string;
  readonly clientSecretVariable: string;
  readonly scopes?: readonly string[];
}
```
