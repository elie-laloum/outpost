---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxOptions**. Consultez le [guide sandboxes](../../sandboxes/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: AgentAdapter;
  readonly provider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
