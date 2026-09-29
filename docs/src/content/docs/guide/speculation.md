---
title: "Competing candidates"
description: "Run several agents or approaches on the same task, each on its own branch, and keep the first result that passes your checks."
---

## Race candidates

:::caution[Experimental]
`speculate()` is experimental: its options and result can still change. It selects a branch; it never merges it.
:::

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates: ["minimal", "refactor"].map((key) => ({
    key,
    agent: coder,
    request: {
      brief: { text: `Fix the parser with a ${key} change. Test and commit.` },
    },
  })),
  async validate({ result, sandbox, signal }) {
    if (result.commits.length === 0) return false;
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return tests.status === 0;
  },
});
console.log(result.status, result.winner?.branch);
```

Each candidate starts from the checkout’s current commit, on its own branch `outpost/speculation/<id>/<key>`, in its own worktree and sandbox. The first candidate that `validate` accepts wins; the others stop.

| Option        | Default  | Role                                                                                                                      |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `candidates`  | Required | 1 to 8 requests, each with a unique `key`, an `agent` and a `request`.                                                    |
| `validate`    | Required | Returns `true` when a candidate is acceptable.                                                                            |
| `budget`      | Required | Attempts and tokens shared by every candidate.                                                                            |
| `concurrency` | `2`      | Candidates running at once, 1 to 8. The others wait for a free slot.                                                      |
| `cleanupMs`   | `30000`  | How long to wait for each sandbox to close, each resource recovery on resume and running candidates after a cancellation. |
| `sandbox`     | None     | Sandbox settings shared by every candidate: `hooks`, `bootstrap`, `limits`.                                               |
| `durability`  | None     | Saves the race so it survives a crash: see below.                                                                         |

For a complete scenario with Codex against Claude Code, see the recipe [Let agents compete](../compete-agents/).

## Validate real behaviour

`validate` receives the candidate’s `key`, its dispatch `result` and its still-open `sandbox`. Run your tests there and return `true` only when they pass: an agent saying it passed is not evidence.

Pass `signal` to every command. It fires when another candidate wins or the race stops.

The winner’s `commit` is `HEAD` read after `validate` returns. A commit made during validation becomes part of the winner; uncommitted edits do not. A reviewer agent dispatched in `validate` must therefore not commit: see [Let a review agent decide](../compete-agents/).

## Read the result

| `result.status`    | Meaning                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `winner`           | A candidate passed; see `result.winner`.                             |
| `no-winner`        | Every candidate that ran was rejected or failed.                     |
| `budget-exhausted` | The budget stopped the race first; see `result.error`.               |
| `quota`            | No winner, and a usage or rate limit stopped at least one candidate. |
| `aborted`          | Your `signal` cancelled the race.                                    |

`result.candidates` lists every candidate with its `branch`, `status`, dispatch `result` and `error`:

| Candidate status | Meaning                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `winner`         | Passed `validate` first.                                              |
| `rejected`       | `validate` returned `false`.                                          |
| `failed`         | The sandbox, the agent, `validate` or the cleanup threw; see `error`. |
| `quota`          | A usage or rate limit stopped it; see `quota.resetAt`.                |
| `cancelled`      | Stopped by a winner, the token budget or your `signal`.               |
| `skipped`        | Never started.                                                        |

`result.usage` holds the attempts and tokens counted against the budget. `result.host.changed` tells you whether your checkout moved during the race.

## Budget and cleanup

<!-- features -->

- **Attempt limit**: Each candidate start uses one of `budget.attempts`. Once reached, no new candidate starts; running ones finish.
- **Token limit**: Once `budget.usage` is reached, every running candidate is cancelled.
- **Winner**: Running candidates are cancelled and waiting ones are skipped.

Tokens used inside `validate`, such as a reviewer agent’s, do not count in `budget`. Running candidates can exceed the token limit before their usage is reported. [Budgets](../budgets/) explains how limits are measured.

Each sandbox is released when its candidate ends. If it does not close within `cleanupMs`, the candidate reports `cleanup: "pending"`, with its `resourceId` in a durable race. A durable race with a pending cleanup stays owned: call `recoverSpeculation()` before the next `speculate()`.

## What is kept

Candidate branches always stay in your repository, winners and losers alike.

A worktree is removed only when it is clean. One with uncommitted, untracked or ignored files, such as `node_modules`, stays under `.outpost/workspaces`, and its path is in the candidate’s `retainedDirectory`. A failed candidate’s worktree is kept too, and durable races keep every candidate’s worktree. [Retention and cleanup](../retention/) shows how to remove them.

## Check integration before merging

`result.integration` tells you whether the winner merges into your checkout’s `HEAD`, computed with `git merge-tree` without touching your files or index.

| `integration.status` | Meaning                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `clean`              | The branch merges without conflict.                                            |
| `conflict`           | The conflicting paths are in `conflicts`.                                      |
| `blocked`            | See `reason`: uncommitted changes, detached `HEAD`, a moved branch or old Git. |

Your checkout can change after the race. Check again right before you merge:

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

export async function canMerge(branch: string, commit?: string) {
  const check = await checkSpeculationIntegration(repository, branch, commit);
  return check.status === "clean";
}
```

Pass `winner.branch` and `winner.commit`. A branch that moved since validation is `blocked`. The check never merges: run `git merge` yourself.

## Survive a crash

Pass `durability` to `speculate()`. Attempts, usage, outputs and allocated resources are saved through a [transport](../storage/), and a finished race is returned without running again.

```ts
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "parser-race",
  version: "1",
};
```

Change `version` when you change the agents or `validate`. A saved race whose briefs, budget, provider or `version` differ is rejected: start it under a new `runId`.

Durable races need a provider that can find and stop its sandboxes after a crash. Docker and Podman in their default mounted mode can; other providers are rejected unless you [implement recovery](../custom-sandbox-providers/).

### Recover after a crash

A crashed race stays owned by its coordinator, the process that ran `speculate()`. Release it before replaying.

<!-- flow -->

1. **Stop**: End the old coordinator.
   - **Stop the process**: A timeout or a missing PID does not prove it stopped.
     - host
2. **Inspect**: Read the saved race.
   - **Read the saved state**: Keep its `revision`; the content lists each candidate’s `resourceId`.
     - `transporter.read()`
3. **Release**: Give up the old ownership.
   - **Recover**: Fails if the revision changed since you read it; deletes nothing.
     - `recoverSpeculation()`
4. **Replay**: Run the race again.
   - **Authorize replay**: Same options, with `resume: "retry-incomplete"` in `durability`.
     - `speculate()`
   - **Reconcile**: Registered sandboxes are stopped; interrupted candidates restart on a new branch.
     - sandbox

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport, recoverSpeculation } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const runId = "parser-race";
const key = `speculations/${createHash("sha256").update(runId).digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  await recoverSpeculation({
    transporter,
    runId,
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

An interrupted candidate runs again as a new attempt, on `…/<key>/2`, from the original commit. Its earlier branch and worktree are listed in `result.previousAttempts`. Candidates validated before the crash keep their outcome.

## Resume after a quota

A durable race that ends with status `quota` is not final. Calling `speculate()` again with the same `durability` reruns only the candidates a usage or rate limit stopped, as new attempts. `result.quota.resetAt` gives the reset time when the agent reports it; [Quota pauses](../quota-pauses/) covers waiting for it.

## Limits

- `speculate()` never merges, pushes or opens a pull request.
- A `clean` integration is not a lock: any later change to your checkout makes it stale.
- `cleanupMs` bounds the wait, not the provider: a `pending` sandbox may still run until you reconcile it.
- Recovery resumes the race, not an interrupted agent process. A replayed candidate can repeat external effects.
- A durable race needs its worktrees on disk: a remote transport saves the state, not the checkout.
- Durable results must hold JSON values, and a crash mid-run makes usage incomplete: add `budget.attempts` next to token limits.

API: [speculate](../../reference/speculate/) · [SpeculationOptions](../../reference/speculationoptions/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculationDurability](../../reference/speculationdurability/) · [recoverSpeculation](../../reference/recoverspeculation/).
