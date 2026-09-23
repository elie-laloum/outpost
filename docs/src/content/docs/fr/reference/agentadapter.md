---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentAdapter**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [AgentEvent](../agentevent/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)
