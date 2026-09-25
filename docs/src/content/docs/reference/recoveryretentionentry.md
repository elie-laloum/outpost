---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionEntry**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                        |
| ------------ | --------------------- | -------- | ------------------------------------------------------------------------------ |
| `path`       | `string`              | Required | See the linked contract and this family's rules for its interpretation.        |
| `category`   | `string`              | Required | See the linked contract and this family's rules for its interpretation.        |
| `bytes`      | `number`              | Required | See the linked contract and this family's rules for its interpretation.        |
| `eligible`   | `boolean`             | Required | See the linked contract and this family's rules for its interpretation.        |
| `reason`     | `string`              | Required | See the linked contract and this family's rules for its interpretation.        |
| `branch`     | `string \| undefined` | Optional | Git workspace policy or resulting branch identity, according to this contract. |
| `head`       | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |
| `modifiedAt` | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```
