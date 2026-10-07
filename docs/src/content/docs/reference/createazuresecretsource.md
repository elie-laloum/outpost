---
title: "createAzureSecretSource"
description: "createAzureSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAzureSecretSource } from "@elie-laloum/outpost/secrets/azure";
```

## Purpose and behavior

Create an Azure Key Vault reader using the caller’s host SDK client and credentials. Map selected environment names to vault names and optional versions, pass cancellation to getSecret and return text values. The caller owns the client and the vault endpoint.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name              | Type                                             | Presence | Meaning                                                                                                                                                           |
| ----------------- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `AzureSecretSourceOptions`                       | Required | Host client or connection configuration and explicit secret selection for the Azure adapter.                                                                      |
| `options.client`  | `Pick<SecretClient, "getSecret">`                | Required | Caller-owned Azure SecretClient with the chosen vault URL and host credentials. Only getSecret is used, with abortSignal; client ownership stays with the caller. |
| `options.secrets` | `Readonly<Record<string, AzureSecretReference>>` | Required | Mapping from environment identifiers to vault names and optional versions, copied at construction and checked for the full selection before reading.              |

## Returns

`SecretSource`

## Signature

```ts
export declare function createAzureSecretSource(
  options: AzureSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [AzureSecretSourceOptions](../azuresecretsourceoptions/)
- [SecretSource](../secretsource/)
