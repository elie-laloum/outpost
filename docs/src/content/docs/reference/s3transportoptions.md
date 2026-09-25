---
title: "S3TransportOptions"
description: "S3TransportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { S3TransportOptions } from "@elie-laloum/outpost/transports/s3";
```

## Parameters and properties

| Name     | Type                  | Presence | Meaning                                                                                                                                                      |
| -------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client` | `S3Client`            | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes. |
| `bucket` | `string`              | Required | Existing bucket supporting conditional PUT and DELETE operations; the adapter does not create buckets.                                                       |
| `prefix` | `string \| undefined` | Optional | Optional private prefix for Outpost objects. Keep unrelated objects outside this prefix; defaults to the bucket root.                                        |

## Signature

```ts
import type { S3Client } from "@aws-sdk/client-s3";

export interface S3TransportOptions {
  readonly client: S3Client;
  readonly bucket: string;
  readonly prefix?: string;
}
```
