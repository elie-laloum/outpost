---
title: "AzureSecretSourceOptions"
description: "AzureSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AzureSecretSourceOptions } from "@elie-laloum/outpost/secrets/azure";
```

## Parameters and properties

| Name      | Type                                             | Presence | Meaning                                                                                                                                                           |
| --------- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `Pick<SecretClient, "getSecret">`                | Required | Caller-owned Azure SecretClient with the chosen vault URL and host credentials. Only getSecret is used, with abortSignal; client ownership stays with the caller. |
| `secrets` | `Readonly<Record<string, AzureSecretReference>>` | Required | Mapping from environment identifiers to vault names and optional versions, copied at construction and checked for the full selection before reading.              |

## Signature

```ts
import type { SecretClient } from "@azure/keyvault-secrets";

export interface AzureSecretSourceOptions {
  readonly client: Pick<SecretClient, "getSecret">;
  readonly secrets: Readonly<Record<string, AzureSecretReference>>;
}
```

## Related contracts

- [AzureSecretReference](../azuresecretreference/)
