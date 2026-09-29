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

Create an object transport using the caller’s S3Client. GET reads are bounded and PUT writes are conditional. Default removal requires atomic conditional DELETE. Set deleteMode to "tombstone" for R2: conditional PUT markers fence stale removal and recreation, remain physically stored, and are hidden from reads and paginated lists using additional HEAD requests. Use the same mode for every writer in a prefix and stop all writers before physically purging markers. Every envelope has a fresh identity, including identical payloads and markers. The caller retains ownership of the optional AWS SDK client.

[Complete example and detailed rules](../../guide/storage/).

## Parameters and properties

| Name                 | Type                                        | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`            | `S3TransportOptions`                        | Required | Caller-owned S3 client, bucket and isolated object prefix.                                                                                                                                                                                                                                                                                                                                                               |
| `options.client`     | `S3Client`                                  | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes.                                                                                                                                                                                                                                                             |
| `options.bucket`     | `string`                                    | Required | Existing private bucket supporting conditional PUT and paginated listing, plus conditional DELETE in the default delete mode. The adapter does not create buckets.                                                                                                                                                                                                                                                       |
| `options.prefix`     | `string \| undefined`                       | Optional | Optional private prefix for Outpost objects. Keep unrelated objects outside this prefix; defaults to the bucket root.                                                                                                                                                                                                                                                                                                    |
| `options.deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optional | "conditional" (default) requires atomic conditional DELETE support. "tombstone" removes objects through conditional PUT markers for endpoints such as R2; reads and lists hide markers and conditional creation can replace them. All writers sharing a prefix must select the same mode. Markers retain a 1 KiB envelope and listing adds a HEAD per object; physically purge markers only after stopping every writer. |

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
