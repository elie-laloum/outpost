---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxOptions**. See the [sandboxes guide](../../sandboxes/lifecycle/) for behavior, defaults and examples.

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

## Related contracts

- [AgentAdapter](../agentadapter/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
