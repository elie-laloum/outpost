---
title: "ExecutionInspectionSettings"
description: "ExecutionInspectionSettings — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ExecutionInspectionSettings } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name           | Type                                                             | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `steering`     | `Steering \| undefined`                                          | Optional | Controller from createSteering(), attached for the whole dispatch and released when it ends. resume() and fork() do not reuse it.                                                                                                                                                                |
| `agent`        | `DispatchAgent \| undefined`                                     | Optional | Agent that runs the brief: one from createAgent() or createReplayAgent(), or a createFallbackAgent() that moves to its next candidate on a listed quota or unavailable fault. A fallback agent cannot take continuation.                                                                         |
| `response`     | `ResponseSpec<unknown> \| undefined`                             | Optional | Typed response contract: appends final-answer format instructions and the JSON input schema after the rendered brief and steering messages included at turn start. Parses and validates the tagged answer, with up to repairs correction turns. Requires one pass; injection cannot be disabled. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation to continue, by id; fork: true continues a copy and leaves the original unchanged. Requires one pass and an agent that supports resume.                                                                                                                                      |

## Signature

```ts
export type ExecutionInspectionSettings = Pick<
  DispatchOptions<unknown>,
  "agent" | "continuation" | "response" | "steering"
>;
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
