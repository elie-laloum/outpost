---
title: "pruneS3Tombstones"
description: "pruneS3Tombstones — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pruneS3Tombstones } from "@elie-laloum/outpost/transports/s3";
```

## Purpose and behavior

Physically remove tombstone objects under one explicit S3 prefix after every writer has stopped. Refuse missing writersStopped authorization, preserve live empty objects, and return the removed count. This is offline maintenance, not concurrent retention; compatible stores may ignore conditional deletion.

[Complete example and detailed rules](../../guide/object-storage/).

## Parameters and properties

| Name                     | Type                       | Presence | Meaning                                                                                                                                                                                 |
| ------------------------ | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `S3TombstonePruneOptions`  | Required | Explicit S3 prefix and stopped-writer authorization for offline marker deletion.                                                                                                        |
| `options.prefix`         | `string`                   | Required | Nonempty transport prefix; deletion is restricted to its descendants.                                                                                                                   |
| `options.writersStopped` | `true`                     | Required | Required true after stopping every writer sharing the prefix; keep them stopped until pruning ends.                                                                                     |
| `options.signal`         | `AbortSignal \| undefined` | Optional | Optional cancellation signal; completed deletions remain applied.                                                                                                                       |
| `options.client`         | `S3Client`                 | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes.                            |
| `options.bucket`         | `string`                   | Required | Existing private bucket that supports conditional PUT and paginated listing, plus conditional DELETE in the default delete mode. The transport never creates it; an empty name rejects. |

## Returns

`Promise<number>`

## Signature

```ts
export declare function pruneS3Tombstones(
  options: S3TombstonePruneOptions,
): Promise<number>;
```

## Related contracts

- [S3TombstonePruneOptions](../s3tombstonepruneoptions/)
