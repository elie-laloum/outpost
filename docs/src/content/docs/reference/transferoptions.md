---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **TransferOptions**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name         | Type                       | Presence | Meaning                                      |
| ------------ | -------------------------- | -------- | -------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optional | Cooperative cancellation for this operation. |
| `deadlineMs` | `number \| undefined`      | Optional | Hard operation deadline in milliseconds.     |

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
