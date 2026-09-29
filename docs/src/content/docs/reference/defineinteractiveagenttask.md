---
title: "defineInteractiveAgentTask"
description: "defineInteractiveAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a checkpointed agent dialogue with durable human-input waits between turns. The task allocates and closes a sandbox per turn, captures its conversation and retains a named worktree without integrating it. Both the Outpost harness and CLI adapters require portable capture and resume. The result is lossless JSON plus conversation and workspace references; interrupted turns require explicit replay authorization.

[Complete example and detailed rules](../../guide/interactive-tasks/).

## Parameters and properties

| Name                       | Type                                    | Presence | Meaning                                                                                                                                       |
| -------------------------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `InteractiveAgentTaskOptions`           | Required | Agent, repository, authorized respondents and bounded dialogue settings.                                                                      |
| `options.key`              | `string`                                | Required | Stable workflow task key; also participates in the retained branch identity.                                                                  |
| `options.after`            | `readonly Task<unknown>[] \| undefined` | Optional | Dependencies that must finish successfully before the first turn.                                                                             |
| `options.repository`       | `string`                                | Required | Host Git checkout containing the retained worktree and default conversation storage; must remain accessible on resume.                        |
| `options.agent`            | `Agent`                                 | Required | Composed CLI or Outpost agent with portable conversation capture and continuation enabled.                                                    |
| `options.brief`            | `string`                                | Required | Literal initial instructions; human replies are supplied separately on subsequent turns.                                                      |
| `options.actors`           | `readonly string[]`                     | Required | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                 |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`          | Optional | Execution provider used to allocate a fresh sandbox for each turn; omitting it uses normal sandbox defaults.                                  |
| `options.bootstrap`        | `boolean \| undefined`                  | Optional | Whether the sandbox may install a missing CLI agent when preparing each turn.                                                                 |
| `options.conversationHome` | `string \| undefined`                   | Optional | Host home used to locate captured native conversations across turns.                                                                          |
| `options.maxTurns`         | `number \| undefined`                   | Optional | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely. |
| `options.timeoutMs`        | `number \| undefined`                   | Optional | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                              |

## Returns

`Task<InteractiveAgentResult>`

## Signature

```ts
export declare function defineInteractiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;
```

## Related contracts

- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
