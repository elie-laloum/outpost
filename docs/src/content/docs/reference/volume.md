---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                   | Presence | Meaning                                                    |
| ---------- | ---------------------- | -------- | ---------------------------------------------------------- |
| `source`   | `string`               | Required | Host path to mount into the sandbox.                       |
| `target`   | `string`               | Required | Absolute destination path of the mount inside the sandbox. |
| `readOnly` | `boolean \| undefined` | Optional | Mount the volume without write access from the sandbox.    |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
