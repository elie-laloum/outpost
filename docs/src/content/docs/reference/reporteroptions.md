---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                    | Presence | Meaning                                                        |
| --------- | --------------------------------------- | -------- | -------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optional | Human-readable label used in execution reporting.              |
| `verbose` | `boolean \| undefined`                  | Optional | Include detailed agent and tool events in terminal output.     |
| `quiet`   | `boolean \| undefined`                  | Optional | Suppress all reporter output, including warnings and failures. |
| `write`   | `((text: string) => void) \| undefined` | Optional | Custom sink for formatted reporter output.                     |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
