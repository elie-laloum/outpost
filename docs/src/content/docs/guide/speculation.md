---
title: "Run competing candidates"
description: "Try several candidates with explicit validation, budgets and integration controls."
---

## Race candidates

Use `speculate()` to run several candidates for the same task and validate each result explicitly. Candidates have separate branches and sandboxes; the race returns a winner only when your validation accepts one. It selects a branch; it never merges it.

API reference: [SpeculationOptions](../../reference/speculationoptions/).

For a complete scenario with Codex against Claude Code, see the recipe [Let agents compete](../compete-agents/).

<!-- tabs -->

```ts title="candidates.ts"
import { coder } from "./outpost.config.ts";

export const candidates = ["minimal", "refactor"].map((key) => ({
  key,
  agent: coder,
  request: {
    brief: { text: `Fix the parser with a ${key} change. Test and commit.` },
  },
}));
```

```ts title="validate.ts"
import type { SpeculationOptions } from "@elie-laloum/outpost/speculation";

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

```ts title="compete.ts"
import { speculate } from "@elie-laloum/outpost/speculation";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";

export const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates,
  validate,
});
console.log(result.status, result.terminationCode, result.winner?.branch);
// Example output: winner undefined outpost/speculation/…/codex
```

## Choose the highest score

Use `select: "best"` to let all admitted candidates finish. `score` runs only after `validate` accepts a candidate, while its sandbox is still open. Return a finite number: the highest score wins after cleanup succeeds. Equal scores follow candidate declaration order. The default `select: "first"` keeps the first accepted candidate and cancels the others.

```ts title="best.ts"
import { speculate } from "@elie-laloum/outpost/speculation";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";

export const best = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2 },
  candidates,
  validate,
  select: "best",
  score: async ({ result }) => -result.usage.output,
});
```

This score favors fewer output tokens. You can instead run checks, inspect the diff or dispatch a judge using `sandbox` and `signal`. Scores are reported on candidate results, including losers. A thrown error, `NaN` or infinity fails that candidate; cancellation or a token budget stop prevents selecting a partial best result. Attempt limits still restrict admissions, so the winner may come from a subset of your candidates.

## Validate real behaviour

`validate` receives the candidate’s `key`, its dispatch `result` and its still-open `sandbox`. Run your tests there and return `true` only when they pass: an agent saying it passed is not evidence.

Pass `signal` to every command. It fires when another candidate wins in first mode or the race stops.

The winner’s `commit` is `HEAD` read after `validate` and any `score` callback return. A commit made during either callback becomes part of the winner; uncommitted edits do not. A reviewer agent dispatched in `validate` must therefore not commit: see [Let a review agent decide](../compete-agents/).

Inspect `result.winner` and the [candidate results](../../reference/speculativecandidateresult/) before deciding which branches to keep.

## Budget and cleanup

<!-- features -->

- **Attempt limit**: Each candidate start uses one of `budget.attempts`. Once reached, no new candidate starts; running ones finish.
- **Token limit**: Once `budget.usage` is reached, every running candidate is cancelled.
- **First winner**: In first mode, running candidates are cancelled and waiting ones are skipped. In best mode, selection waits for admitted candidates.

Tokens used inside `validate` or `score`, such as a reviewer agent’s, do not count in `budget`. Running candidates can exceed the token limit before their usage is reported. [Budgets](../budgets/) explains how limits are measured.

Each sandbox is released when its candidate ends. If it does not close within `cleanupMs`, the candidate reports `cleanup: "pending"`, with its `resourceId` in a durable race. A durable race with a pending cleanup stays owned: call `recoverSpeculation()` before the next `speculate()`.

## What is kept

Candidate branches always stay in your repository, winners and losers alike.

A worktree is removed only when it is clean. One with uncommitted, untracked or ignored files, such as `node_modules`, stays under `.outpost/workspaces`, and its path is in the candidate’s `retainedDirectory`. A failed candidate’s worktree is kept too, and durable races keep every candidate’s worktree. [Retention and cleanup](../retention/) shows how to remove them.

## Check integration before merging

`result.integration` tells you whether the winner merges into your checkout’s `HEAD`, computed with `git merge-tree` without touching your files or index.

API reference: [SpeculationIntegration](../../reference/speculationintegration/).

Your checkout can change after the race. Check again right before you merge:

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";

export async function canMerge(branch: string, commit?: string) {
  const check = await checkSpeculationIntegration(repository, branch, commit);
  return check.status === "clean";
}
```

Pass `winner.branch` and `winner.commit`. A branch that moved since validation is `blocked`. The check never merges: run `git merge` yourself.

Read `result.terminationCode` for a coordinator stop: `aborted`, `quota`, `limit` or `usage-unavailable`. Workflows use the same vocabulary; `budget-exhausted` remains a speculation status, while its reason is `limit` or incomplete accounting. A winner has no termination code. A `no-winner` result also has no coordinator stop code: inspect `candidates` for execution failures and validation rejections.

The race’s `id` identifies its coordinator. Observation follows candidate dispatches; the race does not return a single aggregate `observationId`.

## Resume after a crash

Add durability before the race starts. It preserves progress; replay after a crash still needs explicit authorization.

Pass `durability` to `speculate()`. Attempts, usage, outputs and allocated resources are saved through a [transport](../storage/), and a finished race is returned without running again.

```ts title="durability.ts"
import { join } from "node:path";
import { createLocalTransport } from "@elie-laloum/outpost/core";
import { type SpeculationDurability } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "parser-race",
  version: "1",
};
```

Reuse `candidates.ts` and `validate.ts` from [the first race](#race-candidates). This entry point uses the same budget on every call.

```ts title="durable-race.ts"
import { speculate } from "@elie-laloum/outpost/speculation";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";
import { durability } from "./durability.ts";

const result = await speculate({
  repository,
  sandboxProvider,
  candidates,
  validate,
  budget: { attempts: 2, usage: { output: 20_000 } },
  durability: {
    ...durability,
    ...(process.argv.includes("--retry-incomplete")
      ? { resume: "retry-incomplete" as const }
      : {}),
  },
});
console.log(result.status, result.winner?.branch);
```

`node durable-race.ts` starts the race or reads its completed result. After the inspection and ownership recovery below, `node durable-race.ts --retry-incomplete` authorizes interrupted candidates to run again.

Change `version` when you change the agents, `validate` or `score`. A saved race whose briefs, budget, provider, selection mode or `version` differ is rejected: start it under a new `runId`.

Durable races need a provider that can find and stop its sandboxes after a crash. Docker and Podman in their default mounted mode can; other providers are rejected unless you [implement recovery](../custom-sandbox-providers/).

### Recover after a crash

A crashed race stays owned by its coordinator, the process that ran `speculate()`. Release it before replaying.

1. Stop the old coordinator and confirm it has exited; a timeout or missing PID is insufficient.
2. Read the saved race through the transport. Inspect candidate resource IDs and keep the current revision.
3. Call `recoverSpeculation()` with that revision to release ownership. A changed revision is refused; this call deletes nothing.
4. Run the same race with `durability.resume: "retry-incomplete"`. Outpost reconciles registered sandboxes, then restarts interrupted candidates on new branches.

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport } from "@elie-laloum/outpost/core";
import { recoverSpeculation } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const key = `speculations/${createHash("sha256").update("parser-race").digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  // Example output: {"runId":"parser-race",…}
  await recoverSpeculation({
    transporter,
    runId: "parser-race",
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

An interrupted candidate runs again as a new attempt, on `…/<key>/2`, from the original commit. Its earlier branch and worktree are listed in `result.previousAttempts`. Candidates validated and scored before the crash keep their saved scores; best selection still waits for the remaining admitted candidates. A crash during scoring requires an explicitly authorized new attempt.

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

<span id="read-the-result"></span>

[Run competing candidates](../speculation/).
