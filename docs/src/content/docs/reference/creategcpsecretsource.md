---
title: "createGcpSecretSource"
description: "createGcpSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGcpSecretSource } from "@elie-laloum/outpost/secrets/gcp";
```

## Purpose and behavior

Create a Google Cloud Secret Manager reader using a caller-owned SDK client. Access only selected complete version resources, including regional names, and decode bytes or REST base64 into strict UTF-8. Refuse missing or invalid text; cancellation through fromSecrets stops waiting while an in-flight SDK call may finish.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name              | Type                                                      | Presence | Meaning                                                                                                                                                                                                                                |
| ----------------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `GcpSecretSourceOptions`                                  | Required | Host client or connection configuration and explicit secret selection for the Gcp adapter.                                                                                                                                             |
| `options.client`  | `Pick<SecretManagerServiceClient, "accessSecretVersion">` | Required | Caller-owned SecretManagerServiceClient authenticated on the host; only accessSecretVersion is used. fromSecrets bounds waiting but cannot cancel an already-started SDK call; the caller closes the client.                           |
| `options.secrets` | `Readonly<Record<string, string>>`                        | Required | Environment-name mapping to projects/&lt;project>/secrets/&lt;secret>/versions/&lt;version>, optionally with locations/&lt;location> after the project. Version is latest or a positive integer; only selected resources are accessed. |

## Returns

`SecretSource`

## Signature

```ts
export declare function createGcpSecretSource(
  options: GcpSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [GcpSecretSourceOptions](../gcpsecretsourceoptions/)
- [SecretSource](../secretsource/)
