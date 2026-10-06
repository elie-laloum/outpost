---
title: "NoulAnswer"
description: "NoulAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NoulAnswer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                 |
| ------ | -------- | -------- | ------------------------------------------------------- |
| `type` | `"noul"` | Required | Answer discriminator noul.                              |
| `noul` | `number` | Required | Native finite probability of yes, between zero and one. |

## Signature

```ts
export interface NoulAnswer {
  readonly type: "noul";
  readonly noul: number;
}
```
