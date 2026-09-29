---
title: "ReplayDivergence"
description: "ReplayDivergence — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { ReplayDivergence } from "@elie-laloum/outpost";
```

## Purpose and behavior

OutpostError with code replay, thrown when a replay differs from its journal. kind, turn, expected, actual and commit locate the difference; details holds the same fields.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind`              | Required | Divergence category: prompt, baseline, tree, exhausted or unrecorded.                                                                                                                                                                                                                                                                                                                                                                 |
| `turn`     | `number`                            | Required | One-based index of the recorded turn being replayed.                                                                                                                                                                                                                                                                                                                                                                                  |
| `expected` | `string \| undefined`               | Required | Recorded value: prompt text, tree ID or the reason the workspace commits were not recorded.                                                                                                                                                                                                                                                                                                                                           |
| `actual`   | `string \| undefined`               | Required | Value observed during replay: rendered prompt, tree ID or Git apply error.                                                                                                                                                                                                                                                                                                                                                            |
| `commit`   | `string \| undefined`               | Required | Recorded commit whose patch or tree diverged, for tree divergences.                                                                                                                                                                                                                                                                                                                                                                   |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Metadata describing retained workspace and transfer artifacts after failure.                                                                                                                                                                                                                                                                                                                                                          |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.                                                                                                                                                                                                                                                                                                                                                                 |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Structured diagnostics attached to the fault code. HTTP model errors include status and, when valid, retryAfterMs: the minimum wait in milliseconds for an explicitly configured task retry. Quota errors include resetAt when the reset time is known, and agent for CLI turns. Agent and model outages add unavailable, the signal read by unavailableFault(); a quota error summarizing an exhausted fallback agent adds fallback. |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                                                                                                                                                                                                                                                                                                       |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                                                                                                                                                                                                                                                                                                                                                                            |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                                                                                                                                                                                                                                                                                                                                                                                 |
| `cause`    | `unknown`                           | Optional | Original failure attached to this error.                                                                                                                                                                                                                                                                                                                                                                                              |

## Signature

```ts
export declare class ReplayDivergence extends OutpostError {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected: string | undefined;
  readonly actual: string | undefined;
  readonly commit: string | undefined;
  constructor(details: ReplayDivergenceDetails);
}
```

## Related contracts

- [OutpostError](../outposterror/)
- [ReplayDivergenceDetails](../replaydivergencedetails/)
- [ReplayDivergenceKind](../replaydivergencekind/)
