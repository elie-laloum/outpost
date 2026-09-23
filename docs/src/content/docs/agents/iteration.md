---
title: "Passes and completion markers"
description: "Passes and completion markers — Outpost"
sidebar:
  order: 7
---

Set a bounded number of passes when an agent should iterate until a completion marker appears.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: { file: "brief.md" },
  passes: 5,
  until: ["<outpost>done</outpost>"],
});
console.log(result.completed, result.completion, result.turns.length);
```

`passes` is a positive integer, default `1`. `until` accepts one string or an array. The default marker is `<outpost>done</outpost>`; `until: []` disables marker matching. Tell the agent what marker to print and what “done” means for your task.

## Cold versus warm

Top-level `dispatch({ passes })` provisions a fresh sandbox for each pass while coordinating workspace changes. Installed tools or process state in a previous sandbox do not survive its destruction. `sandbox.dispatch({ passes })` reuses the same running environment. Both reread file briefs each pass.

Completion ends the loop. If a process continues running after the marker, `settleMs` allows a grace period; subsequent output refreshes it. This is separate from the hard command deadline. Without a marker, exhausting the pass budget returns `completed: false`.

Structured responses and native conversation continuations require `passes: 1`. Use response repair attempts for invalid structured output, and explicit `resume` calls for deliberate continuation. Do not combine those mechanisms with a multi-pass loop.

For silence, progress warnings and hard limits, see [cancellation](../cancellation/).
