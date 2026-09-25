---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 10
---

Public contract for **Volume**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name       | Type                   | Presence | Meaning                                                                 |
| ---------- | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `source`   | `string`               | Required | See the linked contract and this family's rules for its interpretation. |
| `target`   | `string`               | Required | See the linked contract and this family's rules for its interpretation. |
| `readOnly` | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
