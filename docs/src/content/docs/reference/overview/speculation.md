---
title: "Speculative execution — Overview"
description: "Race several agent candidates on separate branches, validate each in its own sandbox and select one branch without merging it."
sidebar:
  label: Overview
  order: 0
---

## How a race runs

:::caution[Experimental]
Speculation is experimental: its options and results can still change.
:::

`speculate()` starts every candidate from the checkout’s `HEAD` and keeps the first one that `validate` accepts. It selects a branch; it never merges it.

| Stage      | What happens                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Start      | Each candidate gets the branch `outpost/speculation/<id>/<key>`, its own worktree and sandbox; `concurrency` run at once   |
| Admission  | Each start consumes one `budget.attempts`; at the limit no new candidate starts, running ones finish                       |
| Validation | `validate` runs in the candidate’s live sandbox; `HEAD` read after it returns becomes the candidate’s `commit`             |
| Selection  | The first accepted candidate whose sandbox closes wins; running candidates are cancelled, waiting ones skipped             |
| Stop       | Reaching a `budget.usage` limit cancels running candidates; aborting `signal` ends the race with status `aborted`          |
| Cleanup    | A sandbox that does not close within `cleanupMs` (default 30000) leaves the candidate with `cleanup: "pending"`            |
| Result     | `integration` holds a `git merge-tree` preflight of the winner against the current `HEAD`, without touching files or index |

:::note
A `clean` preflight is an observation, not an authorization. Rerun `checkSpeculationIntegration()` with `winner.branch` and `winner.commit` right before you merge.
:::

## Durable races and recovery

`durability` saves ownership, attempts, usage and outputs through a Transport, and every write is conditional on the last revision. It requires a provider with `recover`: Docker and Podman in mounted mode; isolated containers and other providers reject it with code `configuration`.

| Situation                                                | Result                                         | What to do                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| The `runId` already finished                             | The saved outcome is returned; nothing reruns  | Use a new `runId` for a new race                                                                       |
| Another coordinator owns the `runId`, running or crashed | `speculate()` rejects: already owned           | Stop that coordinator, read the object’s revision, pass it to `recoverSpeculation()`                   |
| Candidates were running or validating when it stopped    | `speculate()` rejects without authorization    | Pass `resume: "retry-incomplete"`: interrupted candidates restart on `…/<key>/<n+1>` from the baseline |
| A sandbox exceeded `cleanupMs`                           | `cleanup: "pending"`; the race stays owned     | Recover ownership; the next `speculate()` stops the registered resource first                          |
| The race ended with status `quota`                       | Not final                                      | Call `speculate()` again: only quota-stopped candidates rerun, as new attempts                         |
| Version, briefs, budget, provider or repository changed  | `speculate()` rejects: incompatible checkpoint | Start under a new `runId`                                                                              |

Durable races keep every worktree, and attempts and tokens add up across calls, so a replay consumes budget. Validated candidates keep their outcome; earlier attempts are listed in `previousAttempts`.

:::caution
`recoverSpeculation()` only releases ownership: it stops and deletes nothing. Stop the old coordinator first; revision fencing rejects its later writes, not its side effects.
:::

## Entry points

Guide: [Competing candidates](../../../guide/speculation/) · [Let agents compete](../../../guide/compete-agents/) · [Add a sandbox provider](../../../guide/custom-sandbox-providers/)

- [speculate](../../speculate/)
- [recoverSpeculation](../../recoverspeculation/)
- [checkSpeculationIntegration](../../checkspeculationintegration/)
- [SpeculationOptions](../../speculationoptions/)
- [SpeculativeCandidate](../../speculativecandidate/)
- [SpeculativeValidation](../../speculativevalidation/)
- [SpeculationResult](../../speculationresult/)
- [SpeculativeCandidateResult](../../speculativecandidateresult/)
- [SpeculationDurability](../../speculationdurability/)
- [SpeculationIntegration](../../speculationintegration/)
