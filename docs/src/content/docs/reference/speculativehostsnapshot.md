---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeHostSnapshot**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name          | Type      | Presence | Meaning                                                                        |
| ------------- | --------- | -------- | ------------------------------------------------------------------------------ |
| `head`        | `string`  | Required | See the linked contract and this family's rules for its interpretation.        |
| `branch`      | `string`  | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `fingerprint` | `string`  | Required | See the linked contract and this family's rules for its interpretation.        |
| `dirty`       | `boolean` | Required | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
