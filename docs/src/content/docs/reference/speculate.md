---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Speculation is experimental: its options and result can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run 1 to 8 candidates from the checkout’s HEAD, each on its own branch and sandbox. By default select the first accepted candidate whose sandbox closes; select: best waits for admitted candidates and picks the highest finite score, with declaration order breaking ties. Returns every outcome, shared usage and the winner’s merge preflight; never merges. Invalid options reject with code configuration.

[Complete example and detailed rules](../../guide/speculation/).

## Parameters and properties

| Name                      | Type                                                                                                                         | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `SpeculationOptions<T>`                                                                                                      | Required | Repository, sandbox provider, candidates, shared budget and validate callback, plus concurrency, cleanup and durability settings.                                                                                                                                                                                                                                                                                          |
| `options.durability`      | `SpeculationDurability \| undefined`                                                                                         | Optional | Saves the race through a Transport so it can resume after a crash or a quota stop. Requires a provider with recover; omit it for an in-memory race.                                                                                                                                                                                                                                                                        |
| `options.cleanupMs`       | `number \| undefined`                                                                                                        | Optional | Wait for each sandbox close or resource recovery, and for running candidates after cancellation, default 30000. Past it, cleanup stays pending.                                                                                                                                                                                                                                                                            |
| `options.observation`     | `ObservationHub \| undefined`                                                                                                | Optional | Parent hub for the events of every candidate, scoped by candidate key; it replaces each request's own observation.                                                                                                                                                                                                                                                                                                         |
| `options.repository`      | `string`                                                                                                                     | Required | Host Git checkout. Its HEAD commit when the race first starts is the baseline of every candidate branch.                                                                                                                                                                                                                                                                                                                   |
| `options.sandboxProvider` | `SandboxProvider`                                                                                                            | Required | Provider that allocates each candidate's sandbox. Durable mode requires one with recover: Docker or Podman in mounted mode.                                                                                                                                                                                                                                                                                                |
| `options.candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | 1 to 8 candidates with unique keys, started in list order as concurrency allows.                                                                                                                                                                                                                                                                                                                                           |
| `options.concurrency`     | `number \| undefined`                                                                                                        | Optional | Maximum candidates running at once, 1 to 8, default 2.                                                                                                                                                                                                                                                                                                                                                                     |
| `options.select`          | `"first" \| "best" \| undefined`                                                                                             | Optional | first (default) selects the first validated candidate whose sandbox closes and cancels the others. best lets all admitted candidates finish, then chooses the highest finite score among accepted candidates with successful cleanup; ties follow candidate declaration order. Cancellation or token exhaustion prevents best selection.                                                                                   |
| `options.score`           | `((candidate: SpeculativeValidation<T>) => number \| Promise<number>) \| undefined`                                          | Optional | Required only with select: best. Runs after validate accepts a candidate, before its sandbox closes, with the same key, result, sandbox and signal. Return a finite number; higher wins, including negative scores. A throw or invalid score fails that candidate. Saved scores are reused during durable recovery; change durability.version when this callback changes. Nested agent usage is outside the shared budget. |
| `options.budget`          | `WorkflowBudget`                                                                                                             | Required | Limits shared by all candidates. Each start consumes one of attempts and the limit stops new starts; reaching a usage token limit cancels running candidates. Tokens used inside validate or score are not counted.                                                                                                                                                                                                        |
| `options.signal`          | `AbortSignal \| undefined`                                                                                                   | Optional | Aborting it cancels running candidates and ends the race with status aborted.                                                                                                                                                                                                                                                                                                                                              |
| `options.sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "limits" \| "logging" \| "bootstrap" \| "conversationHome"> \| undefined` | Optional | Sandbox settings applied to every candidate: hooks, bootstrap, logging, limits, storageQuota and conversationHome.                                                                                                                                                                                                                                                                                                         |
| `options.validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | Decides whether a finished candidate is acceptable, given its dispatch output and live sandbox; true accepts it. A throw marks the candidate failed.                                                                                                                                                                                                                                                                       |

## Returns

`Promise<SpeculationResult<T>>`

## Signature

```ts
export declare function speculate<T = undefined>(
  options: SpeculationOptions<T>,
): Promise<SpeculationResult<T>>;
```

## Related contracts

- [SpeculationOptions](../speculationoptions/)
- [SpeculationResult](../speculationresult/)
