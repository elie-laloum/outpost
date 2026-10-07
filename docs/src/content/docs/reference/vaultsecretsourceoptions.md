---
title: "VaultSecretSourceOptions"
description: "VaultSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { VaultSecretSourceOptions } from "@elie-laloum/outpost/secrets/vault";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                                                                                         |
| ----------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`   | `string`              | Required | Explicit absolute HTTP(S) server URL for Vault or OpenBao, optionally with a proxy base path; credentials, queries and fragments are refused.                   |
| `token`     | `string`              | Required | Declared host-side read token, sent only in X-Vault-Token headers. Must be nonempty without line breaks; never forwarded as a sandbox variable by this adapter. |
| `mount`     | `string`              | Required | KV v2 mount name, such as kv or secret; encoded path segments must be nonempty without traversal.                                                               |
| `path`      | `string`              | Required | Document path relative to mount, such as outpost/prod. One document is fetched and its requested fields are selected; do not include the API data segment.      |
| `version`   | `number \| undefined` | Optional | Positive integer KV v2 document version; omitted selects the service’s latest version.                                                                          |
| `namespace` | `string \| undefined` | Optional | Optional namespace header for the chosen Vault/OpenBao server, with no line breaks.                                                                             |

## Signature

```ts
export interface VaultSecretSourceOptions {
  readonly address: string;
  readonly token: string;
  readonly mount: string;
  readonly path: string;
  readonly version?: number;
  readonly namespace?: string;
}
```
