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

## Parameters and properties

| Name                   | Type                             | Presence | Meaning                                                                                                                  |
| ---------------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `clientIdVariable`     | `string`                         | Required | Declared variable holding the OAuth client ID.                                                                           |
| `clientSecretVariable` | `string`                         | Required | Declared variable holding the OAuth client secret, sent with client_secret_basic or client_secret_post from the sandbox. |
| `scopes`               | `readonly string[] \| undefined` | Optional | OAuth scopes requested with the token. Without it the bridge uses the scope of the server's 401 challenge, if any.       |

## Signature

```ts
export interface McpClientCredentials {
  readonly clientIdVariable: string;
  readonly clientSecretVariable: string;
  readonly scopes?: readonly string[];
}
```
