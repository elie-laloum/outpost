---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentAdapter**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AgentAdapter {
  readonly name: string;
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
