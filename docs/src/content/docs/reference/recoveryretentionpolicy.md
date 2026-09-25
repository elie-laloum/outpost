---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionPolicy**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name            | Type                                               | Presence | Meaning                                                                 |
| --------------- | -------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `version`       | `1`                                                | Required | Caller-controlled contract or graph version.                            |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs")[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `minAgeMs`      | `number`                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `maxBytes`      | `number \| undefined`                              | Optional | See the linked contract and this family's rules for its interpretation. |
| `maxWorkspaces` | `number \| undefined`                              | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly ("clean-workspaces" | "closed-logs")[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
