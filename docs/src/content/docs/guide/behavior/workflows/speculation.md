---
title: Speculative candidates
description: Race bounded candidate branches with explicit validation and observed usage limits.
sidebar:
  order: 12
---

`speculate()` is an opt-in research prototype for trying several agent approaches to one repository. It pins the initial host commit, creates distinct named branches and workspaces, and runs up to eight candidates with configurable concurrency (two by default). Each candidate uses the supplied provider. Worktree separation is not an adversarial security boundary; `localSandboxProvider()` explicitly executes on the host.

```ts
import {
  agent as composeAgent,
  codexHarness,
  speculate,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await speculate({
  repository: "/path/to/repository",
  sandboxProvider: dockerSandboxProvider({ image: "outpost-agent:local" }),
  concurrency: 2,
  budget: { attempts: 2, usage: { input: 100_000, output: 20_000 } },
  candidates: [
    {
      key: "minimal",
      agent: composeAgent({ harness: codexHarness({}) }),
      request: {
        brief: { text: "Fix the bug with a small patch and commit it." },
      },
    },
    {
      key: "alternative",
      agent: composeAgent({ harness: codexHarness({}) }),
      request: {
        brief: { text: "Try another solution, test it and commit it." },
      },
    },
  ],
  async validate({ sandbox, signal }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch, result.host.changed);
```

Build and authenticate the image using your usual [provider setup](../../../environment/providers/overview/). This helper does not configure agent credentials. The mandatory validation callback runs after a successful dispatch with the candidate sandbox still open. Return `true` only when its output satisfies your acceptance criteria. A thrown validation error fails that candidate. Keep validation read-only apart from temporary test outputs; returned commits describe the dispatch, before validation.

The first candidate to pass validation **and finish its owned cleanup** wins. Its selection cooperatively aborts running competitors and prevents queued candidates from starting. The helper waits for every admitted candidate, synchronization and owned sandbox cleanup before returning. Agent adapters, providers and validators must honor cancellation; this is not a hard termination deadline for arbitrary custom code. Supply the validation signal to commands and other cancellable work.

## Budgets and recovery

The shared `budget` uses the same observed token accounting as workflows, including streamed usage from failed attempts. `attempts` counts admitted candidates, not individual turns, repair calls or billable requests. An attempt limit blocks new admissions while admitted candidates may finish. Reaching a reported usage limit aborts the running group. Concurrent usage and delayed or missing vendor reports can exceed the limit; tokens are not a billing cap. Use provider-side spending controls where required. An empty budget `{}` explicitly leaves usage unlimited; the candidate and concurrency limits still apply.

Results include every candidate's status, unique branch name, successful dispatch output when available, error and retained workspace location. Clean managed worktrees are removed after success or validation rejection; their named branches remain. Failed or cancelled work, dirty worktrees, detached worktrees and cleanup failures preserve recovery locations. Inspect `error` and `recoveryDetails(error)` for dispatch recovery metadata, including logs and transcripts. Loser branches are never deleted automatically. A candidate may still have produced useful commits even when cancelled.

No candidate is pushed or integrated automatically. Review `winner.branch`, its commits and any `retainedDirectory`; uncommitted files require separate review. The returned `baseline` is the shared starting commit. `host.before`, `host.after` and `host.changed` compare the host branch, commit, index, tracked changes and nonignored untracked files (excluding `.outpost`). An initial dirty host remains untouched and is recorded in `host.before.dirty`; its edits are not copied into candidates. A failed final snapshot sets `host.changed` and `host.error` without losing candidate results.

These snapshots are advisory observations, not an atomic integration lock. Ignored files are outside the comparison, and the host can change after return. Before manually merging or cherry-picking a winner, inspect current host changes, compare the branch against `baseline`, and resolve conflicts explicitly. The helper exposes no automatic integration operation.

This prototype keeps scheduling and selection in memory. It does not resume a race after process restart, guarantee cleanup after a host crash, rank solution quality beyond your validator, or provide cross-repository transactions. Use retained branches and [recovery inspection](../../../operations/recovery/) to review interrupted runs.
