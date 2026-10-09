---
title: "SpeculationOptions"
description: "SpeculationOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                                                                                         | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `durability`      | `SpeculationDurability \| undefined`                                                                                         | Optional | Saves the race through a Transport so it can resume after a crash or a quota stop. Requires a provider with recover; omit it for an in-memory race.                                                                                                                                                                                                                                                                        |
| `cleanupMs`       | `number \| undefined`                                                                                                        | Optional | Wait for each sandbox close or resource recovery, and for running candidates after cancellation, default 30000. Past it, cleanup stays pending.                                                                                                                                                                                                                                                                            |
| `observation`     | `ObservationHub \| undefined`                                                                                                | Optional | Parent hub for the events of every candidate, scoped by candidate key; it replaces each request's own observation.                                                                                                                                                                                                                                                                                                         |
| `repository`      | `string`                                                                                                                     | Required | Host Git checkout. Its HEAD commit when the race first starts is the baseline of every candidate branch.                                                                                                                                                                                                                                                                                                                   |
| `sandboxProvider` | `SandboxProvider`                                                                                                            | Required | Provider that allocates each candidate's sandbox. Durable mode requires one with recover: Docker or Podman in mounted mode.                                                                                                                                                                                                                                                                                                |
| `candidates`      | `readonly SpeculativeCandidate<T>[]`                                                                                         | Required | 1 to 8 candidates with unique keys, started in list order as concurrency allows.                                                                                                                                                                                                                                                                                                                                           |
| `concurrency`     | `number \| undefined`                                                                                                        | Optional | Maximum candidates running at once, 1 to 8, default 2.                                                                                                                                                                                                                                                                                                                                                                     |
| `select`          | `"first" \| "best" \| undefined`                                                                                             | Optional | first (default) selects the first validated candidate whose sandbox closes and cancels the others. best lets all admitted candidates finish, then chooses the highest finite score among accepted candidates with successful cleanup; ties follow candidate declaration order. Cancellation or token exhaustion prevents best selection.                                                                                   |
| `score`           | `((candidate: SpeculativeValidation<T>) => number \| Promise<number>) \| undefined`                                          | Optional | Required only with select: best. Runs after validate accepts a candidate, before its sandbox closes, with the same key, result, sandbox and signal. Return a finite number; higher wins, including negative scores. A throw or invalid score fails that candidate. Saved scores are reused during durable recovery; change durability.version when this callback changes. Nested agent usage is outside the shared budget. |
| `budget`          | `WorkflowBudget`                                                                                                             | Required | Limits shared by all candidates. Each start consumes one of attempts and the limit stops new starts; reaching a usage token limit cancels running candidates. Tokens used inside validate or score are not counted.                                                                                                                                                                                                        |
| `signal`          | `AbortSignal \| undefined`                                                                                                   | Optional | Aborting it cancels running candidates and ends the race with status aborted.                                                                                                                                                                                                                                                                                                                                              |
| `sandbox`         | `Pick<SandboxOptions, "hooks" \| "storageQuota" \| "logging" \| "bootstrap" \| "conversationHome" \| "limits"> \| undefined` | Optional | Sandbox settings applied to every candidate: hooks, bootstrap, logging, limits, storageQuota and conversationHome.                                                                                                                                                                                                                                                                                                         |
| `validate`        | `(candidate: SpeculativeValidation<T>) => boolean \| Promise<boolean>`                                                       | Required | Decides whether a finished candidate is acceptable, given its dispatch output and live sandbox; true accepts it. A throw marks the candidate failed.                                                                                                                                                                                                                                                                       |

## Signature

```ts
export interface SpeculationOptions<T = undefined> {
  readonly durability?: SpeculationDurability;
  readonly cleanupMs?: number;
  readonly observation?: ObservationHub;
  readonly repository: string;
  readonly sandboxProvider: NonNullable<SandboxOptions["sandboxProvider"]>;
  readonly candidates: readonly SpeculativeCandidate<T>[];
  readonly concurrency?: number;
  readonly select?: "first" | "best";
  readonly score?: (
    candidate: SpeculativeValidation<T>,
  ) => number | Promise<number>;
  readonly budget: WorkflowBudget;
  readonly signal?: AbortSignal;
  readonly sandbox?: Pick<
    SandboxOptions,
    | "hooks"
    | "bootstrap"
    | "logging"
    | "limits"
    | "storageQuota"
    | "conversationHome"
  >;
  readonly validate: (
    candidate: SpeculativeValidation<T>,
  ) => boolean | Promise<boolean>;
}
```

## Related contracts

- [SandboxOptions](../sandboxoptions/)
- [SpeculationDurability](../speculationdurability/)
- [SpeculativeCandidate](../speculativecandidate/)
- [SpeculativeValidation](../speculativevalidation/)
- [WorkflowBudget](../workflowbudget/)
