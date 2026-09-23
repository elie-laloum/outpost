---
title: "Errors and recovery"
description: "Errors and recovery — Outpost"
sidebar:
  order: 1
---

Inspect the original error and its recovery metadata before deleting a workspace or retrying a stateful operation.

```ts
import {
  dispatch,
  codex,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";

try {
  await dispatch({
    agent: codex(),
    brief: { text: "Implement and test the fix." },
  });
} catch (error) {
  if (error instanceof OutpostError) console.error(error.code, error.details);
  console.error(recoveryDetails(error));
  throw error;
}
```

`OutpostError` contains `code`, frozen `details`, `recovery` and optional `cause`. Codes are `configuration`, `process`, `timeout`, `aborted`, `workspace`, `conflict`, `prompt`, `response`, `session` and `provider`. Multiple failures may be an `AggregateError`. Cancellation may retain a native error identity; use `recoveryDetails` rather than assuming every error is an OutpostError.

## What is preserved

Recovery metadata can include workspace, conversation, commits, transcript and log. Availability depends on how far execution reached. Dirty managed worktrees are retained; clean owned workspaces are removed after startup failure. Named branches survive clean worktree removal.

Remote recovery folders may contain `initial.bundle`/`commits.bundle`, binary-capable patches, `previous-index.patch`, untracked files under `incoming`/`previous-files`, and `state.json`. They represent prior and incoming state, not a guarantee that an interrupted transfer captured everything.

## Recover deliberately

1. Record the error, paths and branch names; keep the recovery directory intact.
2. Inspect the retained worktree with Git status and history.
3. Examine bundles/patches in a separate recovery clone before applying them to valuable work.
4. Resolve local/remote overlap or merge conflicts, then resume with an explicit branch and conversation where appropriate.

Never remove a live lock just to bypass ownership checks.
