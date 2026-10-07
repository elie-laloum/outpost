---
title: "AwsSecretReference"
description: "AwsSecretReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AwsSecretReference } from "@elie-laloum/outpost/secrets/aws";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                                                                                                              |
| -------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`           | `string`              | Required | Exact Secrets Manager secret name or ARN sent as SecretId.                                                                                                                           |
| `field`        | `string \| undefined` | Optional | Own top-level JSON field to extract from SecretString. Without it, use the full text value. The enclosing secret is still fetched; arrays, absent fields and non-string values fail. |
| `versionId`    | `string \| undefined` | Optional | Optional immutable AWS version ID forwarded as VersionId; if combined with versionStage both must identify the same version.                                                         |
| `versionStage` | `string \| undefined` | Optional | Optional AWS version label forwarded as VersionStage; the service defaults to AWSCURRENT when no version selector is supplied.                                                       |

## Signature

```ts
export interface AwsSecretReference {
  readonly id: string;
  readonly field?: string;
  readonly versionId?: string;
  readonly versionStage?: string;
}
```
