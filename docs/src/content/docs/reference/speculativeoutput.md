---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                              | Presence | Meaning                                                                                                                                  |
| --------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `completion`          | `string \| undefined`             | Optional | Completion marker that matched the agent’s output, when one was found.                                                                   |
| `text`                | `string`                          | Required | Final text reported by the agent execution.                                                                                              |
| `conversation`        | `string \| undefined`             | Optional | Available native conversation identity.                                                                                                  |
| `usage`               | `Usage`                           | Required | Reported usage counters; not a currency estimate.                                                                                        |
| `fallback`            | `FallbackRecord \| undefined`     | Optional | Present only when the dispatch used a fallback agent: the candidate that produced this result and the candidates that stopped before it. |
| `completed`           | `boolean`                         | Required | Whether the configured completion marker matched.                                                                                        |
| `branch`              | `string`                          | Required | Name of the work branch used or observed during execution.                                                                               |
| `observerErrors`      | `readonly unknown[] \| undefined` | Optional | Collected sink and journal failures, separate from execution success; a supplied shared hub also exposes its accumulated diagnostics.    |
| `directory`           | `string`                          | Required | Host workspace directory used for this execution.                                                                                        |
| `commits`             | `readonly Commit[]`               | Required | Collected Git commit identities and subjects.                                                                                            |
| `transcript`          | `string \| undefined`             | Optional | Available host path to the captured transcript.                                                                                          |
| `transcriptReference` | `TransportReference \| undefined` | Optional | Pinned remote index for the final captured conversation, when using transported conversation storage.                                    |
| `logReference`        | `TransportReference \| undefined` | Optional | Versioned journal index for readJournal, for both local and remote persistence. Absent when logging is disabled or directed to stdout.   |
| `retainedDirectory`   | `string \| undefined`             | Optional | Workspace retained for inspection or recovery.                                                                                           |
| `turns`               | `readonly Turn[]`                 | Required | Ordered agent-turn results, including text, status, duration and token usage for each pass.                                              |
| `value`               | `T`                               | Required | Validated structured response value; undefined when no response specification was supplied.                                              |

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Related contracts

- [WarmDispatchResult](../warmdispatchresult/)
