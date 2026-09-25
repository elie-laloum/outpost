---
title: "A focused fix on its own branch"
description: "A focused fix on its own branch — Outpost"
sidebar:
  order: 1
---

Use this for one well-defined defect. Prerequisites: [shared setup](../../../../guide/cookbook/), Claude authentication and an npm project with a lockfile/test script. Adapt the branch name and defect description.

```ts
import { dispatch, claude } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: claude(),
  branch: { mode: "named", name: "fix/input-validation" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
  brief: {
    text: "Handle empty input in the parser. Add a regression test, run npm test, commit the fix, then write <outpost>done</outpost>.",
  },
  deadlineMs: 600_000,
  idleMs: 120_000,
});
console.log({
  completed: result.completed,
  branch: result.branch,
  commits: result.commits,
  transcript: result.transcript,
});
if (!result.completed)
  throw new Error("The completion marker was not returned");
```

## Expected outcome

The result identifies the branch and commits. Inspect **git diff HEAD...fix/input-validation** and rerun relevant checks before merging. A completion marker is the agent's claim, not proof that tests passed. The named branch is not merged automatically.

## Failure and repetition

A failed process or hook rejects the dispatch. Dirty work is retained for [recovery](../../../../guide/cookbook/recovery/). Reusing the branch continues its history; choose another name for an independent attempt.
