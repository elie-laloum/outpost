---
title: "TriggerHttpRequest"
description: "TriggerHttpRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerHttpRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                            | Presence | Meaning                                                                        |
| --------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `method`  | `string`                                        | Required | HTTP method; routes only receive POST.                                         |
| `path`    | `string`                                        | Required | Request path without query string.                                             |
| `headers` | `Readonly<Record<string, string \| undefined>>` | Required | Request headers with lowercase names; repeated headers are joined with commas. |
| `body`    | `Uint8Array<ArrayBufferLike>`                   | Required | Raw body bytes, verified before any parsing.                                   |

## Signature

```ts
export interface TriggerHttpRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly body: Uint8Array;
}
```
