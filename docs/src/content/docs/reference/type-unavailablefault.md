---
title: "UnavailableFault"
description: "UnavailableFault — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { UnavailableFault } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type     | Presence | Meaning                                                                                                                                                                                                                 |
| --------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string` | Required | The details.unavailable signal: HTTP &lt;status>, HTTP transport failure, a model stream error type, the agent failure text its adapter matched, or connection failure for a timeout after an agent connection failure. |

## Signature

```ts
export interface UnavailableFault {
  /** Terminal signal that identified the agent or model service as unavailable. */
  readonly message: string;
}
```
