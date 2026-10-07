---
title: "createVaultSecretSource"
description: "createVaultSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createVaultSecretSource } from "@elie-laloum/outpost/secrets/vault";
```

## Purpose and behavior

Create a host-side Vault/OpenBao KV v2 reader for one declared mount and document path. Fetch that document once per nonempty selection and return only requested fields, optionally at a pinned version and namespace. Send the host token in HTTP headers, refuse redirects and bound response bytes; KV v1 and dynamic credentials are unsupported.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name                | Type                       | Presence | Meaning                                                                                                                                                         |
| ------------------- | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `VaultSecretSourceOptions` | Required | Host client or connection configuration and explicit secret selection for the Vault adapter.                                                                    |
| `options.address`   | `string`                   | Required | Explicit absolute HTTP(S) server URL for Vault or OpenBao, optionally with a proxy base path; credentials, queries and fragments are refused.                   |
| `options.token`     | `string`                   | Required | Declared host-side read token, sent only in X-Vault-Token headers. Must be nonempty without line breaks; never forwarded as a sandbox variable by this adapter. |
| `options.mount`     | `string`                   | Required | KV v2 mount name, such as kv or secret; encoded path segments must be nonempty without traversal.                                                               |
| `options.path`      | `string`                   | Required | Document path relative to mount, such as outpost/prod. One document is fetched and its requested fields are selected; do not include the API data segment.      |
| `options.version`   | `number \| undefined`      | Optional | Positive integer KV v2 document version; omitted selects the service’s latest version.                                                                          |
| `options.namespace` | `string \| undefined`      | Optional | Optional namespace header for the chosen Vault/OpenBao server, with no line breaks.                                                                             |

## Returns

`SecretSource`

## Signature

```ts
export declare function createVaultSecretSource(
  options: VaultSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [SecretSource](../secretsource/)
- [VaultSecretSourceOptions](../vaultsecretsourceoptions/)
