---
title: "createOnePasswordSecretSource"
description: "createOnePasswordSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOnePasswordSecretSource } from "@elie-laloum/outpost/secrets/onepassword";
```

## Purpose and behavior

Create a reader using the caller’s authenticated 1Password SDK client. Resolve only selected environment-name mappings to explicit op:// references, validate the complete selection before any read and retain caller ownership of the client. Cancellation through fromSecrets stops waiting, but does not cancel an in-flight SDK request.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name              | Type                                                        | Presence | Meaning                                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `OnePasswordSecretSourceOptions`                            | Required | Host client or connection configuration and explicit secret selection for the OnePassword adapter.                                                                                                                             |
| `options.client`  | `{ readonly secrets: Pick<Client["secrets"], "resolve">; }` | Required | Caller-authenticated host client exposing secrets.resolve, such as the official 1Password SDK with service-account authentication. It remains caller-owned; no desktop login or system keychain lookup is selected by Outpost. |
| `options.secrets` | `Readonly<Record<string, string>>`                          | Required | Mapping of environment identifiers to explicit op://vault/item/field or op://vault/item/section/field references; only selected mappings are resolved, with no vault/item enumeration.                                         |

## Returns

`SecretSource`

## Signature

```ts
export declare function createOnePasswordSecretSource(
  options: OnePasswordSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [OnePasswordSecretSourceOptions](../onepasswordsecretsourceoptions/)
- [SecretSource](../secretsource/)
