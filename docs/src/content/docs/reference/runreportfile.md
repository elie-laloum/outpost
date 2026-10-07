---
title: "RunReportFile"
description: "RunReportFile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportFile } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                | Presence | Meaning                                                                                                                                 |
| --------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `paths`   | `readonly string[]` | Required | Repository-relative path, or old and new paths for a rename. Paths retain their literal characters in JSON and are escaped in Markdown. |
| `added`   | `number`            | Required | Added text lines for this file; zero for binary files even when their bytes changed.                                                    |
| `removed` | `number`            | Required | Removed text lines for this file; zero for binary files even when their bytes changed.                                                  |
| `binary`  | `boolean`           | Required | True when Git numstat cannot count this file’s added and removed lines.                                                                 |

## Signature

```ts
export interface RunReportFile {
  readonly paths: readonly string[];
  readonly added: number;
  readonly removed: number;
  readonly binary: boolean;
}
```
