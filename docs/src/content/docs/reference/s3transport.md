---
title: "s3Transport"
description: "s3Transport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { s3Transport } from "@elie-laloum/outpost/transports/s3";
```

## Purpose and behavior

Create an object transport using the caller’s S3Client. GET reads are bounded, PUT and DELETE are conditional, and listing follows pagination. Each written envelope includes a fresh identity, preventing identical-payload writes from reusing a previous revision. Requires the optional AWS SDK and an endpoint implementing these semantics.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name             | Type                  | Presence | Meaning                                                                                                                                                      |
| ---------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`        | `S3TransportOptions`  | Required | Caller-owned S3 client, bucket and isolated object prefix.                                                                                                   |
| `options.client` | `S3Client`            | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes. |
| `options.bucket` | `string`              | Required | Existing bucket supporting conditional PUT and DELETE operations; the adapter does not create buckets.                                                       |
| `options.prefix` | `string \| undefined` | Optional | Optional private prefix for Outpost objects. Keep unrelated objects outside this prefix; defaults to the bucket root.                                        |

## Returns

`Transport`

## Signature

```ts
export declare function s3Transport(options: S3TransportOptions): Transport;
```

## Related contracts

- [S3TransportOptions](../s3transportoptions/)
- [Transport](../transport/)
