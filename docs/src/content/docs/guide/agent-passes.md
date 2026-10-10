---
title: "Repeat a brief across passes"
description: "Stop at a completion marker while keeping independent verification explicit."
---

Start from [Set deadlines and cancel work](../limits-and-cancellation/) and its configuration. Stop at a completion marker while keeping independent verification explicit.

## Repeat the brief until the agent declares it done

`passes` sends the brief again when a pass ends without a completion marker. Ask for the marker in the brief: Outpost does not add it.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/flaky-tests" },
  brief: {
    text: "Fix the flaky tests and commit. When every test passes, end your answer with READY_FOR_REVIEW.",
  },
  passes: 3,
  until: "READY_FOR_REVIEW",
});
console.log(result.completed, result.completion);
// Example output: true READY_FOR_REVIEW
```

Each pass starts a new conversation on the same branch, so it sees the previous commits. Outpost stops at the first pass whose answer contains a marker. `until` also accepts a list; `until: []` disables matching and runs every pass.

API reference: [DispatchResult](../../reference/dispatchresult/).

:::caution
A marker is the agent’s declaration, not proof. Run your tests before relying on it; [Verification loops](../verification-loops/) repeat the agent until your check passes.
:::

If the agent writes its marker but keeps running, Outpost stops it `settleMs` after its last output. The result is kept and `warn` receives a message.
