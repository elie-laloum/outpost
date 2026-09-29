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

| Name         | Type                                        | Presence | Meaning                                                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`     | `S3Client`                                  | Required | S3Client configured by the caller with region, credentials and any compatible endpoint. Outpost does not destroy it or forward its credentials to sandboxes.                                                                                                                          |
| `bucket`     | `string`                                    | Required | Existing private bucket that supports conditional PUT and paginated listing, plus conditional DELETE in the default delete mode. The transport never creates it; an empty name rejects.                                                                                               |
| `prefix`     | `string \| undefined`                       | Optional | Key prefix for every Outpost object, default the bucket root; must be a valid transport key, trailing slash allowed. Keep unrelated objects outside it.                                                                                                                               |
| `deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optional | How remove() works: "conditional" (default) sends a conditional DELETE; "tombstone", for R2, overwrites the object with a hidden 1 KiB marker and makes list() send one HEAD per object. Every writer of a prefix must use the same mode; purge markers only after stopping them all. |

## Signature

```ts
import type { S3Client } from "@aws-sdk/client-s3";

export interface S3TransportOptions {
  readonly client: S3Client;
  readonly bucket: string;
  readonly prefix?: string;
  readonly deleteMode?: "conditional" | "tombstone";
}
```
