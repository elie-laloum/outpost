---
title: "RunReportDiff"
description: "RunReportDiff — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportDiff } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                       | Presence | Meaning                                                                                                                       |
| -------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `baseline`     | `string`                   | Required | Exact HEAD commit before execution; for several cold passes, the first pass baseline.                                         |
| `head`         | `string`                   | Required | Exact HEAD commit after synchronization; for several cold passes, the last pass head.                                         |
| `files`        | `readonly RunReportFile[]` | Required | Git numstat entries between baseline and head with rename detection. A renamed file occupies one entry containing both paths. |
| `filesChanged` | `number`                   | Required | Number of changed file entries in the net committed diff; a rename counts once.                                               |
| `added`        | `number`                   | Required | Sum of added text lines in the net committed diff; binary entries contribute zero.                                            |
| `removed`      | `number`                   | Required | Sum of removed text lines in the net committed diff; binary entries contribute zero.                                          |
| `binaryFiles`  | `number`                   | Required | Number of diff entries Git reports as binary, whose changed lines cannot be counted.                                          |

## Signature

```ts
export interface RunReportDiff {
  readonly baseline: string;
  readonly head: string;
  readonly files: readonly RunReportFile[];
  readonly filesChanged: number;
  readonly added: number;
  readonly removed: number;
  readonly binaryFiles: number;
}
```

## Related contracts

- [RunReportFile](../runreportfile/)
