---
title: "Recover a failed run"
description: "Recover a failed run — Outpost"
sidebar:
  order: 7
---

Use this when partial work matters. Complete the [shared setup](../../../cookbook/) and Claude authentication. Cleanup and transcript collection can continue beyond the request timeout.

```ts
import {
  agent as composeAgent,
  dispatch,
  claudeHarness,
  recoveryDetails,
} from "@elie-laloum/outpost";

try {
  const result = await dispatch({
    agent: composeAgent({ harness: claudeHarness({}) }),
    branch: { mode: "named", name: "fix/recoverable-parser" },
    brief: { text: "Fix parser errors, run tests and commit." },
    signal: AbortSignal.timeout(300_000),
  });
  console.log(result.branch, result.transcript);
} catch (error) {
  console.error(
    "Run failed:",
    error instanceof Error ? error.message : String(error),
  );
  console.error("Recovery locations:", recoveryDetails(error));
  process.exitCode = 1;
}
```

## Inspect before retrying

Use the workspace path to inspect Git status/diffs and read the journal/transcript when present. Not every failure has every field: provisioning may fail before a conversation exists. Preserve the original error and retained worktree.

## Resume deliberately

With a valid transcript, supply its conversation ID through **continuation: { id }** on a new dispatch, or use a successful result's **resume**. Configure authentication again. A transcript restores history, not the previous home, processes or uncommitted files.

Keep the named branch's commits. Inspect retained worktrees before moving/deleting them. See [continuation](../../../agents/conversations/) and [recovery details](../../../operations/recovery/).
