---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentAdapter**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                 |
| ----------------------- | ----------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`                  | `string`                                              | Required | See the linked contract and this family's rules for its interpretation. |
| `bootstrap`             | `string \| undefined`                                 | Optional | Whether to install a missing selected agent automatically.              |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | See the linked contract and this family's rules for its interpretation. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                  |
| `conversations`         | `"claude" \| "codex" \| undefined`                    | Optional | See the linked contract and this family's rules for its interpretation. |
| `storage`               | `ConversationStore \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `capture`               | `boolean \| undefined`                                | Optional | See the linked contract and this family's rules for its interpretation. |
| `resumable`             | `boolean \| undefined`                                | Optional | See the linked contract and this family's rules for its interpretation. |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `request`               | `(input: AgentInput) => Command`                      | Required | See the linked contract and this family's rules for its interpretation. |
| `events`                | `(line: string) => readonly AgentEvent[]`             | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface AgentAdapter {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)
