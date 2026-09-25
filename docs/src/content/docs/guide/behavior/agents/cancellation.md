---
title: "Timeouts and cancellation"
description: "Timeouts and cancellation — Outpost"
sidebar:
  order: 10
---

Use `AbortSignal` for caller-controlled cancellation and deadlines for bounded execution. They apply to different stages.

| Option             | Default                                                      | Scope                                                     |
| ------------------ | ------------------------------------------------------------ | --------------------------------------------------------- |
| `idleMs`           | 600,000 ms                                                   | Maximum silence before completion; output resets it.      |
| `idleWarningMs`    | 60,000 ms                                                    | Progress warning interval during silence.                 |
| `settleMs`         | 60,000 ms                                                    | Grace period after a completion marker; output resets it. |
| `deadlineMs`       | 3,600,000 ms                                                 | Hard deadline per agent command.                          |
| `expansionMs`      | 30,000 ms                                                    | Each embedded brief command.                              |
| `limits.copyMs`    | 60,000 ms for workspace copy; 120,000 ms for remote transfer | Selected input copies and transfer override.              |
| `limits.gitMs`     | 30,000 ms                                                    | Workspace Git setup.                                      |
| `limits.collectMs` | 30,000 ms                                                    | Commit collection.                                        |
| `limits.mergeMs`   | 30,000 ms                                                    | Host integration.                                         |

Limits must be finite positive values where accepted; a zero value does not disable the watchdog. Use a suitably large bounded value when necessary.

```ts
import {
  agent as composeAgent,
  dispatch,
  codexHarness,
} from "@elie-laloum/outpost";

await dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Inspect the repository and summarize." },
  signal: AbortSignal.timeout(120_000),
  deadlineMs: 90_000,
});
```

One-shot `signal` covers setup and execution. A signal on `createSandbox` covers setup; provide a signal on subsequent operations separately. Command cancellation terminates the active process group on supported backends while leaving the warm environment reusable.

Cleanup and recovery may continue after cancellation to collect changes and release resources. The original cancellation reason is preserved; inspect `recoveryDetails(error)` for attached context. Workflow task deadlines are cooperative: arbitrary JavaScript must honor `context.signal` itself.
