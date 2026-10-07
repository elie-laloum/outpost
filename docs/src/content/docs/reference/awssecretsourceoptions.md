---
title: "AwsSecretSourceOptions"
description: "AwsSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AwsSecretSourceOptions } from "@elie-laloum/outpost/secrets/aws";
```

## Parameters and properties

| Name      | Type                                           | Presence | Meaning                                                                                                                                                                                                      |
| --------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client`  | `Pick<SecretsManagerClient, "send">`           | Required | Caller-owned SecretsManager SDK client, authenticated on the host. The adapter uses only send with GetSecretValueCommand and passes abortSignal; it never destroys the client.                               |
| `secrets` | `Readonly<Record<string, AwsSecretReference>>` | Required | Explicit mapping from environment identifiers to AWS secret IDs or ARNs and optional field/version selectors. The complete selection is checked before a read, and mappings are snapshotted at construction. |

## Signature

```ts
import type { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export interface AwsSecretSourceOptions {
  readonly client: Pick<SecretsManagerClient, "send">;
  readonly secrets: Readonly<Record<string, AwsSecretReference>>;
}
```

## Related contracts

- [AwsSecretReference](../awssecretreference/)
