---
title: "Candidate selection"
description: "Validate competing agent results before choosing a winner."
---

:::note[Experimental]
`speculate()` is an opt-in helper for bounded competing executions.
:::

Provide a repository, sandbox provider, up to eight candidates, a shared budget and a `validate` callback. Each candidate runs on a separate branch. `concurrency` defaults to two.

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
      brief: {
        text: `Fix the parser using a ${key} approach. Test and commit.`,
      },
    },
  })),
  async validate({ sandbox }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch);
```

## Validate actual behavior

The callback receives the candidate’s live sandbox and output. Run the required checks there and return true only when the candidate is acceptable. An agent’s claim that it passed is not enough to select it.

## Budget and cleanup

The shared budget governs attempts and observed token usage. Already-running candidates can consume additional usage before their results arrive. Losing candidates are cancelled and resources are closed according to ownership rules; recoverable work remains subject to preservation.

Review the selected result and host state before integration. Candidate racing does not authorize publication or resolve every possible host conflict. See the exact `SpeculationResult` and the [roadmap](../../project/roadmap/) before relying on this research path.

API: [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/) · [recoverSpeculation](../../reference/recoverspeculation/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/).

## Durable races and recovery

These additions are available in 7.0.0; speculation remains experimental. Add `durability: { transporter, runId: "parser-race", version: "1" }` to the options above. Use `createLocalTransport({ directory: join(repository, ".outpost", "storage") })` for local persistence, or an explicitly configured remote Transport. The caller owns the transport. Change `version` when agent implementations, validation or provider settings change. Results must contain lossless JSON values or top-level `undefined`.

Mounted Docker/Podman providers support durable cleanup. Local host execution, isolated containers, Vercel, Daytona and Firecracker currently reject durable races unless a custom provider implements the recovery contract. A custom provider must await `context.registerRecovery(resourceId)` exactly once before allocation and implement idempotent `recover(resourceId, options)` that preserves repository data. Registering after allocation leaves an unrecoverable crash window and violates this contract.

After a coordinator crash:

1. Stop the old coordinator independently. An expired timeout or remote PID does not prove it is stopped.
2. Inspect the race envelope using `transporter.list("speculations/")` and `transporter.read(entry.key)`. The key is `speculations/<SHA-256 of runId>.json`; retain the inspected object's `revision` and resource IDs.
3. Call `recoverSpeculation({ transporter, runId, revision, coordinatorStopped: true })`. A changed revision rejects recovery. This releases ownership; it does not itself delete resources.
4. Call `speculate()` with the same configuration and `durability.resume: "retry-incomplete"` to authorize replay. Registered resources are reconciled before new attempts. A completed race is returned without allocating candidates again.

A race finished with status `quota` is not final: the next call reruns only the candidates a usage or rate limit stopped, as new attempts. See [quota pauses](../quota-pauses/#speculation).

Validated candidates survive a crash between validation and cleanup. Interrupted executions run on a new branch from the original baseline; their old branches and worktrees remain available in `previousAttempts`. Durable mode preserves candidate worktrees even on success. Workspaces, Git history and any filesystem transcripts must still be accessible: putting the checkpoint in S3 does not make the checkout portable. This resumes orchestration, not an interrupted agent process. Replay can repeat external effects and consumes another attempt; it does not provide exactly-once execution.

Observed usage and attempt counts are cumulative. A crash during execution marks usage incomplete because unreported tokens cannot be reconstructed. Token-only budgets then refuse further admissions; supply an attempt budget as well. Checkpoint writes use conditional revisions to fence old coordinators. A storage error stops admissions; ownership remains for explicit recovery. Errors persist as diagnostic strings, not live Error instances.

`cleanupMs` defaults to 30 seconds for each resource close/recovery and for workers after cancellation. A deadline bounds waiting, not a provider's physical ability to stop. `cleanup: "pending"` and registered resource IDs remain visible when work does not settle; ownership remains held. Stop the coordinator before recovering it, and reconcile any resource that still runs. Late provider completion can still occur until that coordinator is stopped. A crash before resource registration leaves no allocated sandbox under the provider contract, but can leave a worktree to inspect.

## Check integration

The selected winner includes `result.integration`: `clean`, `conflict` with file paths, or `blocked` with a reason. Dirty or detached host checkouts block the check. Git must support `merge-tree --write-tree`; unavailable support is reported as blocked. The check records exact commits and does not modify working files or the index.

Immediately before an explicit merge, rerun `checkSpeculationIntegration(repository, winner.branch, winner.commit)`. A moved candidate branch blocks the check. Any host change makes a previous result stale; a clean check is neither a lock nor merge authorization. Resolve conflicts explicitly and preserve the candidate branch for review.
