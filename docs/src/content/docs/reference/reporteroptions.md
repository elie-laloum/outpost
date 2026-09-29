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

| Name      | Type                                    | Presence | Meaning                                                                                                                                                                      |
| --------- | --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optional | Prefix printed in brackets on every line, default outpost; the pass number follows it.                                                                                       |
| `verbose` | `boolean \| undefined`                  | Optional | Also print tool inputs and result previews, prompts, raw protocol lines, conversation IDs, harness steps and compactions, the workspace directory and successful operations. |
| `quiet`   | `boolean \| undefined`                  | Optional | Suppress all reporter output, including warnings and failures.                                                                                                               |
| `write`   | `((text: string) => void) \| undefined` | Optional | Receives each formatted chunk of output instead of process.stdout.                                                                                                           |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
