---
title: "GcpSecretSourceOptions"
description: "GcpSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GcpSecretSourceOptions } from "@elie-laloum/outpost/secrets/gcp";
```

## Parameters and properties

| Name      | Type                                                      | Presence | Meaning                                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `Pick<SecretManagerServiceClient, "accessSecretVersion">` | Required | Caller-owned SecretManagerServiceClient authenticated on the host; only accessSecretVersion is used. fromSecrets bounds waiting but cannot cancel an already-started SDK call; the caller closes the client.                           |
| `secrets` | `Readonly<Record<string, string>>`                        | Required | Environment-name mapping to projects/&lt;project>/secrets/&lt;secret>/versions/&lt;version>, optionally with locations/&lt;location> after the project. Version is latest or a positive integer; only selected resources are accessed. |

## Signature

```ts
import type { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export interface GcpSecretSourceOptions {
  readonly client: Pick<SecretManagerServiceClient, "accessSecretVersion">;
  readonly secrets: Readonly<Record<string, string>>;
}
```
