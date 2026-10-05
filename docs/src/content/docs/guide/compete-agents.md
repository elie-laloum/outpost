---
title: "Compare agent approaches"
description: "Run candidates on separate branches and use a check to select a result."
---

## What this example covers

:::caution[Experimental]
`speculate()` is experimental: its options and result can still change. It selects a branch; it never merges it.
:::

Use this example to try several fixes for the same bug. Each candidate works in its own sandbox and branch; your test command decides which result can be accepted.

<!-- features -->

- [Competing candidates](../speculation/): Race up to eight candidates and keep the first acceptable one.
- [Choose an agent](../choose-an-agent/): Compose Codex and Claude Code from their harness presets.
- [Claude Code](../claude-code/): Sign in on the host; the Setup image already contains its CLI.
- [Sandbox sessions](../sandbox-sessions/): Run the tests in the candidate’s open sandbox.
- [Budgets](../budgets/): One budget bounds the attempts and tokens of every candidate.
- [Repository and branch](../repository-and-branch/): Each candidate commits on a named branch in its own worktree.

## Write the script

Save the files shown in the tabs next to the `outpost.config.ts` from [Installation](../setup/). Run `compete.ts` to compare the candidates.

Prepare the candidates and verify their work before considering a merge.

<!-- tabs -->

```ts title="candidate-agents.ts"
import {
  createAgent,
  createCodexHarness,
  createClaudeHarness,
} from "@elie-laloum/outpost";

export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="candidate-briefs.ts"
import { codex, claude } from "./candidate-agents.ts";

export const brief = {
  text: "Fix issue #42: dates before 1970 parse as NaN. Add a regression test, run npm test and commit the fix.",
};
export const candidates = [
  { key: "codex", agent: codex, request: { brief } },
  { key: "claude", agent: claude, request: { brief } },
];
```

```ts title="candidate-check.ts"
import type { SpeculationOptions } from "@elie-laloum/outpost";

export const validate: SpeculationOptions["validate"] = async ({
  result,
  sandbox,
  signal,
}) => {
  if (result.commits.length === 0) return false;
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
};
```

```ts title="run-candidates.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidate-briefs.ts";
import { validate } from "./candidate-check.ts";

export function runCandidates() {
  return speculate({
    repository,
    sandboxProvider,
    candidates,
    concurrency: 2,
    budget: { attempts: 2, usage: { output: 100_000 } },
    validate,
  });
}
```

```ts title="merge-check.ts"
import type { SpeculationResult } from "@elie-laloum/outpost";
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export function verifyWinner(winner: NonNullable<SpeculationResult["winner"]>) {
  return checkSpeculationIntegration(repository, winner.branch, winner.commit);
}
```

Ask for confirmation in `compete.ts`, then check integration again before merging.

<!-- tabs -->

```ts title="merge-winner.ts"
import type { SpeculationResult } from "@elie-laloum/outpost";
import { verifyWinner } from "./merge-check.ts";
import { execFileSync } from "node:child_process";
import { repository } from "./outpost.config.ts";

export async function mergeWinner(
  winner: NonNullable<SpeculationResult["winner"]>,
) {
  const check = await verifyWinner(winner);
  if (check.status !== "clean")
    throw new Error(check.reason ?? `Conflicts: ${check.conflicts.join(", ")}`);
  execFileSync("git", ["merge", "--no-edit", winner.branch], {
    cwd: repository,
    stdio: "inherit",
  });
}
```

```ts title="merge-prompt.ts"
import { createInterface } from "node:readline/promises";

export async function askToMerge(branch: string) {
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return (await prompt.question(`Merge ${branch}? [y/N] `)) === "y";
  } finally {
    prompt.close();
  }
}
```

```ts title="compete.ts"
import { runCandidates } from "./run-candidates.ts";
import { askToMerge } from "./merge-prompt.ts";
import { mergeWinner } from "./merge-winner.ts";

export const result = await runCandidates();
for (const candidate of result.candidates)
  console.log(candidate.key, candidate.status, candidate.branch);
export const { winner, integration } = result;
if (!winner) throw new Error(`No winner: ${result.status}`);
console.log(`${winner.key} wins, integration: ${integration?.status}`);
if (await askToMerge(winner.branch)) await mergeWinner(winner);
```

### Run the script

It prints each candidate’s status and branch, for example `claude winner outpost/speculation/<id>/claude` and `codex cancelled …`, then asks before merging. Review the branch with `git diff` before you answer.

```sh
node compete.ts
```

## Understand the steps

<!-- canvas -->

- [Your script](../speculation/): `compete.ts` calls `speculate()`, prints each candidate, then asks before merging.
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

API reference: [SpeculationResult](../../reference/speculationresult/), [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) and [SpeculationIntegration](../../reference/speculationintegration/).

## Adapt the example

### Try one agent with several approaches

Give the same agent different briefs. With three candidates and `concurrency: 2`, the third starts only when one of the first two finishes without winning.

<!-- tabs -->

```ts title="approaches.ts"
import { coder } from "./outpost.config.ts";

export const approaches = {
  minimal: "Fix issue #42 with the smallest possible change.",
  parser: "Fix issue #42 by rewriting the date parser.",
  temporal: "Fix issue #42 by parsing dates with the Temporal API.",
};
export const candidates = Object.entries(approaches).map(([key, text]) => ({
  key,
  agent: coder,
  request: { brief: { text: `${text} Run npm test and commit.` } },
}));
```

```ts title="check-approach.ts"
import type { SpeculationOptions } from "@elie-laloum/outpost";

export const validate: SpeculationOptions["validate"] = async ({
  sandbox,
  signal,
}) => {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
};
```

```ts title="try-approaches.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./approaches.ts";
import { validate } from "./check-approach.ts";

export const result = await speculate({
  repository,
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: 3 },
  candidates,
  validate,
});
console.log(result.winner?.key);
```

### Let a review agent decide

A reviewer dispatched in the candidate’s sandbox reads its commits and returns a [typed verdict](../typed-responses/). Pass the function as `validate: review`.

<!-- tabs -->

```ts title="review-agent.ts"
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="review-verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";

export const verdict = defineJsonResponse({
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
```

```ts title="test-candidate.ts"
import type { SpeculativeValidation } from "@elie-laloum/outpost";

export async function testBranch({
  sandbox,
  signal,
}: SpeculativeValidation<undefined>) {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
}
```

```ts title="review-candidate.ts"
import type { SpeculativeValidation } from "@elie-laloum/outpost";
import { testBranch } from "./test-candidate.ts";
import { reviewer } from "./review-agent.ts";
import { verdict } from "./review-verdict.ts";

export async function review(candidate: SpeculativeValidation<undefined>) {
  if (!(await testBranch(candidate))) return false;
  const { sandbox, signal } = candidate;
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

### Resume after a crash

Pass `durability` to `speculate()`: attempts, usage and outputs are saved through a [transport](../storage/), and a completed race is returned without running again.

```ts
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

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
