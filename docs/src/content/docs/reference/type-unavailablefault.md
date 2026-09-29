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

| Name      | Type     | Presence | Meaning                                                                                                                                                                                       |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string` | Required | Signal that identified the outage, such as HTTP 503, an overloaded stream error or the recognized agent failure text; a timeout diagnosed as a connection failure reports connection failure. |

## Signature

```ts
export interface UnavailableFault {
  /** Terminal signal that identified the agent or model service as unavailable. */
  readonly message: string;
}
```
