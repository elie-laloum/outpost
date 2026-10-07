---
title: "createAwsSecretSource"
description: "createAwsSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAwsSecretSource } from "@elie-laloum/outpost/secrets/aws";
```

## Purpose and behavior

Create a host-side AWS Secrets Manager reader using a caller-owned SDK client. Read only selected mappings with GetSecretValue, preserve version selectors and optionally extract an own field from a JSON SecretString. Refuse binary secrets and invalid fields; pass cancellation to the SDK. No identity is installed in the sandbox.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name              | Type                                           | Presence | Meaning                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `AwsSecretSourceOptions`                       | Required | Host client or connection configuration and explicit secret selection for the Aws adapter.                                                                                                                   |
| `options.client`  | `Pick<SecretsManagerClient, "send">`           | Required | Caller-owned SecretsManager SDK client, authenticated on the host. The adapter uses only send with GetSecretValueCommand and passes abortSignal; it never destroys the client.                               |
| `options.secrets` | `Readonly<Record<string, AwsSecretReference>>` | Required | Explicit mapping from environment identifiers to AWS secret IDs or ARNs and optional field/version selectors. The complete selection is checked before a read, and mappings are snapshotted at construction. |

## Returns

`SecretSource`

## Signature

```ts
export declare function createAwsSecretSource(
  options: AwsSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [AwsSecretSourceOptions](../awssecretsourceoptions/)
- [SecretSource](../secretsource/)
