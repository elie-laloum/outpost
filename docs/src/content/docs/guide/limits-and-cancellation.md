---
title: "Limits and cancellation"
description: "Bound agent work and cancel it explicitly."
---

Use deadlines to bound a process, an abort signal to cancel an operation, and `passes` to bound repeated agent work.

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";

const request: DispatchOptions = {
  brief: { text: "Fix the parser, run tests and end with READY_FOR_REVIEW." },
  passes: 3,
  until: "READY_FOR_REVIEW",
  deadlineMs: 300_000,
  idleWarningMs: 30_000,
  idleMs: 90_000,
  signal: AbortSignal.timeout(600_000),
};
```

## Choose the right limit

| Setting         | Controls                                            |
| --------------- | --------------------------------------------------- |
| `deadlineMs`    | Each agent process; one hour by default.            |
| `idleMs`        | How long the process may remain silent.             |
| `idleWarningMs` | When to warn about silence.                         |
| `passes`        | Maximum passes; one by default.                     |
| `until`         | Completion marker matching; `[]` disables matching. |
| `settleMs`      | Grace period after completion detection.            |
| `signal`        | Cancellation across the operation.                  |

To change direction without cancelling, [steer the running agent](../steering/) instead of aborting it.

A completion marker expresses the agent’s declaration, not proof of a successful change. Inspect `completed`, `completion` and actual validation results separately.

Workspace `limits` bounds copying, Git preparation, collection and integration. Workflow [token budgets](../budgets/) bound shared observed usage and attempts; they do not replace provider billing limits.

API: [DispatchOptions](../../reference/dispatchoptions/) · [StageLimits](../../reference/stagelimits/).
