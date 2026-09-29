---
title: "InteractiveAgentTaskOptions"
description: "InteractiveAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { InteractiveAgentTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                    | Presence | Meaning                                                                                                                                       |
| ------------------ | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`              | `string`                                | Required | Stable workflow task key; also participates in the retained branch identity.                                                                  |
| `after`            | `readonly Task<unknown>[] \| undefined` | Optional | Dependencies that must finish successfully before the first turn.                                                                             |
| `repository`       | `string`                                | Required | Host Git checkout containing the retained worktree and default conversation storage; must remain accessible on resume.                        |
| `agent`            | `Agent`                                 | Required | Agent with portable conversation capture and resume; otherwise defineInteractiveAgentTask() throws with code configuration.                   |
| `brief`            | `string`                                | Required | Literal initial instructions; human replies are supplied separately on subsequent turns.                                                      |
| `actors`           | `readonly string[]`                     | Required | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                 |
| `sandboxProvider`  | `SandboxProvider \| undefined`          | Optional | Provider that allocates a new sandbox for each turn, default createDockerSandboxProvider().                                                   |
| `bootstrap`        | `boolean \| undefined`                  | Optional | Whether each turn's sandbox may install a missing CLI agent, default true.                                                                    |
| `conversationHome` | `string \| undefined`                   | Optional | Host home used to locate captured native conversations across turns.                                                                          |
| `maxTurns`         | `number \| undefined`                   | Optional | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely. |
| `timeoutMs`        | `number \| undefined`                   | Optional | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                              |

## Signature

```ts
export interface InteractiveAgentTaskOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly repository: string;
  readonly agent: Agent;
  readonly brief: string;
  readonly actors: readonly string[];
  readonly sandboxProvider?: SandboxProvider;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly maxTurns?: number;
  readonly timeoutMs?: number;
}
```

## Related contracts

- [Agent](../type-agent/)
- [SandboxProvider](../sandboxprovider/)
- [Task](../type-task/)
