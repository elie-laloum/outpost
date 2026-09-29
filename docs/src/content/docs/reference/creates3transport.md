---
title: "createS3Transport"
description: "createS3Transport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
```

## Purpose and behavior

Create a transport over your S3Client, imported from @elie-laloum/outpost/transports/s3. Writes are conditional PUTs and reads reject objects larger than maxBytes; removal is a conditional DELETE, or a hidden marker with deleteMode "tombstone" for R2. Outpost never destroys the client.

[Complete example and detailed rules](../../guide/object-storage/).

## Parameters and properties

| Name                 | Type                                        | Presence | Meaning                                                                                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `S3TransportOptions`                        | Required | Caller-owned S3 client, bucket and isolated object prefix.                                                                                                                                                                                                                            |
| `options.client`     | `S3Client`                                  | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes.                                                                                                                          |
| `options.bucket`     | `string`                                    | Required | Existing private bucket that supports conditional PUT and paginated listing, plus conditional DELETE in the default delete mode. The transport never creates it; an empty name rejects.                                                                                               |
| `options.prefix`     | `string \| undefined`                       | Optional | Key prefix for every Outpost object, default the bucket root; must be a valid transport key, trailing slash allowed. Keep unrelated objects outside it.                                                                                                                               |
| `options.deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optional | How remove() works: "conditional" (default) sends a conditional DELETE; "tombstone", for R2, overwrites the object with a hidden 1 KiB marker and makes list() send one HEAD per object. Every writer of a prefix must use the same mode; purge markers only after stopping them all. |

## Returns

`Transport`

## Signature

```ts
export declare function createS3Transport(
  options: S3TransportOptions,
): Transport;
```

## Related contracts

- [S3TransportOptions](../s3transportoptions/)
- [Transport](../transport/)
