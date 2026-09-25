---
title: "RecoveryVerificationOptions"
description: "RecoveryVerificationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryVerificationOptions**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryVerificationOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name            | Type                   | Presence | Meaning                                                                 |
| --------------- | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `restorability` | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `repository`    | `string \| undefined`  | Optional | Target host Git checkout.                                               |
| `checksums`     | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `maxBytes`      | `number \| undefined`  | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
