---
title: "Let agents compete"
description: "Give the same bug to Codex and Claude Code, test each fix in its own sandbox, keep the first one that passes and check that it merges cleanly."
---

## What you use

:::caution[Experimental]
`speculate()` is experimental: its options and result can still change. It selects a branch; it never merges it.
:::

Each candidate fixes the bug on its own branch, in its own sandbox. Your tests decide which one wins.

<!-- features -->

- [Competing candidates](../speculation/): Race up to eight candidates and keep the first acceptable one.
  - `speculate()`
  - `checkSpeculationIntegration()`
- [Choose an agent](../choose-an-agent/): Compose Codex and Claude Code from their harness presets.
  - `createCodexHarness()`
  - `createClaudeHarness()`
- [Claude Code](../claude-code/): Sign in on the host; the Setup image already contains its CLI.
- [Sandbox sessions](../sandbox-sessions/): Run the tests in the candidate’s open sandbox.
  - `sandbox.command()`
- [Budgets](../budgets/): One budget bounds the attempts and tokens of every candidate.
  - `budget`
- [Repository and branch](../repository-and-branch/): Each candidate commits on a named branch in its own worktree.

## The code

The file sits next to the `outpost.config.mts` from [Setup](../setup/).

```ts title="compete.mts"
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import {
  checkSpeculationIntegration,
  createAgent,
  createClaudeHarness,
  createCodexHarness,
  speculate,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const brief = {
  text: "Fix issue #42: dates before 1970 parse as NaN. Add a regression test, run npm test and commit the fix.",
};

const result = await speculate({
  repository,
  sandboxProvider,
  candidates: [
    {
      key: "codex",
      agent: createAgent({
        harness: createCodexHarness({ authentication: "account" }),
      }),
      request: { brief },
    },
    {
      key: "claude",
      agent: createAgent({
        harness: createClaudeHarness({ authentication: "account" }),
      }),
      request: { brief },
    },
  ],
  concurrency: 2,
  budget: { attempts: 2, usage: { output: 100_000 } },
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

for (const candidate of result.candidates)
  console.log(candidate.key, candidate.status, candidate.branch);

const { winner, integration } = result;
if (!winner) throw new Error(`No winner: ${result.status}`);
console.log(`${winner.key} wins, integration: ${integration?.status}`);

const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const answer = await prompt.question(`Merge ${winner.branch}? [y/N] `);
prompt.close();

if (answer === "y") {
  const check = await checkSpeculationIntegration(
    repository,
    winner.branch,
    winner.commit,
  );
  if (check.status !== "clean")
    throw new Error(check.reason ?? `Conflicts: ${check.conflicts.join(", ")}`);
  execFileSync("git", ["merge", "--no-edit", winner.branch], {
    cwd: repository,
    stdio: "inherit",
  });
}
```

```sh
node compete.mts
```

It prints each candidate’s status and branch, for example `claude winner outpost/speculation/<id>/claude` and `codex cancelled …`, then asks before merging. Review the branch with `git diff` before you answer.

## How it works

Each link shows who hands what to whom, in the direction of the arrow.

<!-- canvas -->

- [Your script](../speculation/): `compete.mts` calls `speculate()`, prints each candidate, then asks before merging.
  - host
  - → **Admit**: `speculate()`
  - → **Checkout**: `git merge`, after your answer
- [Race](../speculation/): Every candidate starts from the checkout’s current commit; at most `concurrency` run at once.
  - workflow
  - **Admit**: each start consumes one of `budget.attempts`; the token limit stops them all
    - → **Sandboxes**: the same brief
  - **Validate**: no commits rejects; otherwise `npm test` decides
  - **Select**: the first pass wins; the others are cancelled or skipped
    - → **Your script**: `winner`, `integration`
    - → **Checkout**: `git merge-tree`, read only
- [Sandboxes](../sandbox-sessions/): One per candidate, on `outpost/speculation/<id>/<key>`; released at the end, branches kept.
  - sandbox
  - **codex**: fixes the bug and commits
  - **claude**: fixes the bug and commits
  - → **Validate**: commits, `npm test`
- **Checkout**: Your branch. `checkSpeculationIntegration()` blocks the merge if it or the winner moved since. Outpost does not push.
  - host

`result.status` is `winner`, `no-winner`, `budget-exhausted`, `quota` (a usage limit stopped a candidate, see [Quota pauses](../quota-pauses/)) or `aborted` (your `signal`). Each candidate has its own status:

| Candidate status | Meaning                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `winner`         | Passed `validate` first.                                                    |
| `rejected`       | `validate` returned `false`.                                                |
| `failed`         | An error in the sandbox, the agent, `validate` or the cleanup; see `error`. |
| `quota`          | A usage or rate limit stopped it.                                           |
| `cancelled`      | Stopped by a winner, the budget or your `signal`.                           |
| `skipped`        | Never started.                                                              |

`integration.status` is `clean`, `conflict` (file paths in `conflicts`) or `blocked` (`reason`: uncommitted changes, detached `HEAD`, a moved branch or a Git without `merge-tree --write-tree`).

## Adapt it

### Try one agent with several approaches

Give the same agent different briefs. With three candidates and `concurrency: 2`, the third starts only when one of the first two finishes without winning.

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const approaches = {
  minimal: "Fix issue #42 with the smallest possible change.",
  parser: "Fix issue #42 by rewriting the date parser.",
  temporal: "Fix issue #42 by parsing dates with the Temporal API.",
};

const result = await speculate({
  repository,
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: 3 },
  candidates: Object.entries(approaches).map(([key, text]) => ({
    key,
    agent: coder,
    request: { brief: { text: `${text} Run npm test and commit.` } },
  })),
  async validate({ sandbox, signal }) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return tests.status === 0;
  },
});
console.log(result.winner?.key);
```

### Let a review agent decide

A reviewer dispatched in the candidate’s sandbox reads its commits and returns a [typed verdict](../typed-responses/). Pass the function as `validate: review`.

```ts
import {
  createAgent,
  createClaudeHarness,
  defineJsonResponse,
  type SpeculativeValidation,
} from "@elie-laloum/outpost";

const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
const verdict = defineJsonResponse({
  tag: "verdict",
  schema(input) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("approved" in input) ||
      typeof input.approved !== "boolean"
    )
      throw new Error("Expected approved: boolean");
    return { approved: input.approved };
  },
});

export async function review({
  sandbox,
  signal,
}: SpeculativeValidation<undefined>) {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  if (tests.status !== 0) return false;
  const { value } = await sandbox.dispatch({
    agent: reviewer,
    brief: {
      text: 'Review the commits on this branch for correctness. Do not change any file. Answer <verdict>{"approved":true}</verdict> or false.',
    },
    response: verdict,
    signal,
  });
  return value.approved;
}
```

The review’s tokens do not count in `budget`. The winner’s commit is read after `validate`, so the reviewer must not commit.

### Survive a crash

Pass `durability` to `speculate()`: attempts, usage and outputs are saved through a [transport](../storage/), and a completed race is returned without running again.

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
  runId: "issue-42",
  version: "1",
};
```

`version` is part of the race identity: after changing the candidates or `validate`, start a new race under a new `runId`. Durable races need a provider with recovery, today mounted Docker or Podman, and keep every candidate’s worktree. After a crash, recover the race before replaying it: [Competing candidates](../speculation/).

## Limits

- `speculate()` does not merge, push or open a pull request.
- A `clean` integration is not a lock: any later change to the checkout makes it stale, so check again right before merging.
- Running candidates can exceed the token limit before their usage is reported.
- A worktree with uncommitted, untracked or ignored files, such as `node_modules`, stays under `.outpost/workspaces`: see [Retention and cleanup](../retention/).

API: [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [SpeculationDurability](../../reference/speculationdurability/).
