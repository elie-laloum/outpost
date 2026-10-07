---
title: "OnePasswordSecretSourceOptions"
description: "OnePasswordSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OnePasswordSecretSourceOptions } from "@elie-laloum/outpost/secrets/onepassword";
```

## Parameters and properties

| Name      | Type                                                        | Presence | Meaning                                                                                                                                                                                                                        |
| --------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client`  | `{ readonly secrets: Pick<Client["secrets"], "resolve">; }` | Required | Caller-authenticated host client exposing secrets.resolve, such as the official 1Password SDK with service-account authentication. It remains caller-owned; no desktop login or system keychain lookup is selected by Outpost. |
| `secrets` | `Readonly<Record<string, string>>`                          | Required | Mapping of environment identifiers to explicit op://vault/item/field or op://vault/item/section/field references; only selected mappings are resolved, with no vault/item enumeration.                                         |

## Signature

```ts
import type { Client } from "@1password/sdk";

export interface OnePasswordSecretSourceOptions {
  readonly client: {
    readonly secrets: Pick<Client["secrets"], "resolve">;
  };
  readonly secrets: Readonly<Record<string, string>>;
}
```
