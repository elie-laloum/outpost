---
title: "RunDispatch"
description: "RunDispatch — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunDispatch } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                             | Presence | Meaning                                                                                  |
| ----------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `id`        | `string`                                         | Required | Dispatch observation identity; multiple task dispatches retain distinct records.         |
| `taskKey`   | `string \| undefined`                            | Optional | Owning workflow task key from the dispatch scope, absent for standalone requests.        |
| `attempt`   | `number \| undefined`                            | Optional | Owning workflow task attempt from the dispatch scope.                                    |
| `status`    | `"failed" \| "done" \| "cancelled" \| "running"` | Required | Latest dispatch lifecycle outcome, independent of the enclosing workflow status.         |
| `agent`     | `string \| undefined`                            | Optional | Most recently observed agent name from a phase or fallback event.                        |
| `phase`     | `string \| undefined`                            | Optional | Most recently observed main-agent phase; subagent phases do not replace it.              |
| `branch`    | `string \| undefined`                            | Optional | Observed named branch, when provided by phase or completion events.                      |
| `completed` | `boolean \| undefined`                           | Optional | Whether the dispatch reached its completion contract, reported only at settlement.       |
| `commits`   | `readonly Commit[]`                              | Required | Commits reported at dispatch settlement, including retained recovery commits on failure. |
| `usage`     | `Usage`                                          | Required | Live summed pass usage, replaced by authoritative dispatch usage at settlement.          |
| `passes`    | `readonly RunPass[]`                             | Required | Per-pass accounting used to avoid counting cumulative reports and summaries twice.       |
| `error`     | `RunError \| undefined`                          | Optional | Classified terminal dispatch error, when execution failed or was cancelled.              |

## Signature

```ts
export interface RunDispatch {
  readonly id: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly status: "running" | "done" | "failed" | "cancelled";
  readonly agent?: string;
  readonly phase?: string;
  readonly branch?: string;
  readonly completed?: boolean;
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly passes: readonly RunPass[];
  readonly error?: RunError;
}
```

## Related contracts

- [Commit](../commit/)
- [RunError](../runerror/)
- [RunPass](../runpass/)
- [Usage](../usage/)
