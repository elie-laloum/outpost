---
title: "createReporter"
description: "createReporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createReporter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an observe callback that prints one line per event: phases, tool calls, warnings, failures and each pass summary with its token counts. It writes to process.stdout unless write is given and never changes execution.

[Complete example and detailed rules](../../guide/observability/).

## Parameters and properties

| Name              | Type                                    | Presence | Meaning                                                                                                                                                                      |
| ----------------- | --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optional | Output label, verbosity, silence mode and optional custom writer.                                                                                                            |
| `options.label`   | `string \| undefined`                   | Optional | Prefix printed in brackets on every line, default outpost; the pass number follows it.                                                                                       |
| `options.verbose` | `boolean \| undefined`                  | Optional | Also print tool inputs and result previews, prompts, raw protocol lines, conversation IDs, harness steps and compactions, the workspace directory and successful operations. |
| `options.quiet`   | `boolean \| undefined`                  | Optional | Suppress all reporter output, including warnings and failures.                                                                                                               |
| `options.write`   | `((text: string) => void) \| undefined` | Optional | Receives each formatted chunk of output instead of process.stdout.                                                                                                           |

## Returns

`(event: ObservationEvent & ReportPass) => void`

## Signature

```ts
export declare function createReporter(
  options?: ReporterOptions,
): (event: ObservationEvent & ReportPass) => void;
```

## Related contracts

- [ObservationEvent](../observationevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
