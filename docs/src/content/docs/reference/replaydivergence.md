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

[Complete example and detailed rules](../../guide/record-replay/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind`              | Required | Divergence category: prompt, baseline, tree, exhausted or unrecorded.                                                                                                                                                                                                                                                                                                                   |
| `turn`     | `number`                            | Required | One-based index of the recorded turn being replayed.                                                                                                                                                                                                                                                                                                                                    |
| `expected` | `string \| undefined`               | Required | Recorded value: prompt text, tree ID or the reason the workspace commits were not recorded.                                                                                                                                                                                                                                                                                             |
| `actual`   | `string \| undefined`               | Required | Value observed during replay: rendered prompt, tree ID or Git apply error.                                                                                                                                                                                                                                                                                                              |
| `commit`   | `string \| undefined`               | Required | Recorded commit whose patch or tree diverged, for tree divergences.                                                                                                                                                                                                                                                                                                                     |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Locations of work retained after the failure, such as branch, directory, commits, transcript, logReference or conversation; empty when nothing was retained. A remote synchronization failure puts its transfer directory in details.recovery instead.                                                                                                                                  |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.                                                                                                                                                                                                                                                                                                                   |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Frozen diagnostics for the code: status, stdout, stderr and conversation for a failed agent process; status and retryAfterMs (the minimum wait of a task retry) for an HTTP model error; resetAt for a quota, and fallback when every fallback candidate hit one. unavailable marks an outage for unavailableFault(), including a timeout after an agent reported a connection failure. |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                                                                                                                                                                                                                                                         |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                                                                                                                                                                                                                                                                                                                              |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                                                                                                                                                                                                                                                                                                                                   |
| `cause`    | `unknown`                           | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain.                                                                                                                                                                                                                                                                                             |

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
