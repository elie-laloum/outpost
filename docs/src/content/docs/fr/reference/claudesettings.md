---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ClaudeSettings**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh" | "max";
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
```

## Contrats associés

- [CommonAgentSettings](../support-commonagentsettings/)
